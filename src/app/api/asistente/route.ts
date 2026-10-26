import type Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { anthropic, ASISTENTE_MODEL } from "@/lib/claude";

// Genera el borrador de un curso con Claude (streaming de texto).
// El asistente SOLO genera borradores: nunca publica directamente.
//
// NOTA: NO usa búsqueda web. Se probó en producción y la búsqueda de videos de
// YouTube tardaba varios minutos y terminaba sin escribir el JSON (turnos
// pausados/abortados). Los videos se agregan manualmente en el editor. Las
// imágenes NO dependen de esto: se resuelven aparte contra Wikimedia con el
// campo "imageQuery" (ver crearCursoDesdeBorrador en lib/actions/asistente.ts).

const SYSTEM_PROMPT = `Eres el asistente de creación de cursos de "Academia AA | DOM", la plataforma interna de formación de Ambiente Azul y DOM Design (Colombia).

Tu tarea: a partir del objetivo del admin (y material de referencia si lo hay), diseñar un curso completo en español (Colombia), con tono profesional pero cálido.

Responde ÚNICAMENTE con un JSON válido (sin \`\`\`, sin texto antes ni después) con esta estructura exacta:

{
  "title": "string",
  "description": "string (1-2 frases)",
  "estimatedHours": number,
  "modules": [
    {
      "title": "string",
      "lessons": [
        {
          "title": "string",
          "durationMin": number,
          "imageQuery": "string (OBLIGATORIO en cada lección, EN INGLÉS)",
          "blocks": [
            {"type": "heading", "text": "string"},
            {"type": "paragraph", "text": "string"},
            {"type": "list", "items": ["string", ...]},
            {"type": "callout", "style": "info|tip|warning", "text": "string"}
          ]
        }
      ],
      "exam": null | {
        "title": "string",
        "description": "string",
        "passingScore": number,
        "maxAttempts": 3,
        "timeLimitMin": number,
        "questions": [
          {
            "question": "string",
            "type": "MULTIPLE_CHOICE|MULTI_SELECT|TRUE_FALSE",
            "options": ["string", ...],
            "correctAnswer": number | [number, ...],
            "points": number,
            "explanation": "string"
          }
        ]
      }
    }
  ]
}

Reglas:
- La estructura DEBE salir del contenido, no de una plantilla. Primero piensa el temario natural del tema y agrupa por afinidad real. NO repitas una estructura uniforme: está perfecto que un curso tenga 3 módulos y otro 5, que un módulo tenga 1 lección y el siguiente 4, o que una lección sea corta y otra densa. Si generas N módulos todos con el mismo número de lecciones, lo estás haciendo mal.
- Rango permitido: 2 a 6 módulos; 1 a 5 lecciones por módulo.
- El contenido ESCRITO es el núcleo del curso: cada lección debe tener mínimo 4 bloques de texto (heading, paragraph, list, callout) que enseñen el tema por sí solos.
- Si hay material de referencia, basa el contenido en él fielmente (no inventes datos de la empresa).
- Incluye un examen en el último módulo (4 a 6 preguntas) con explicación en cada pregunta. "exam" en los demás módulos: null.
- TRUE_FALSE usa options ["Verdadero", "Falso"]. MULTI_SELECT usa correctAnswer como arreglo de índices. MULTIPLE_CHOICE usa un índice numérico. Los índices empiezan en 0.

Videos:
- NO incluyas bloques {"type":"video"}. Este asistente no busca videos; el administrador los agregará después en el editor de lecciones si los necesita. Jamás inventes URLs ni IDs de YouTube.

Imágenes (vía imageQuery, NO incluyas bloques de imagen):
- NO incluyas bloques {"type":"image"}. En su lugar, CADA lección DEBE llevar el campo "imageQuery" (obligatorio, nunca lo omitas): un término corto y visual EN INGLÉS (2 a 4 palabras, ej. "hot tub filter", "swimming pool tiles", "customer service handshake") que describa una foto ilustrativa de esa lección.
- El sistema usará ese término para buscar automáticamente una imagen libre en Wikimedia Commons. Elige términos genéricos y fotografiables (objetos, lugares, acciones), no conceptos abstractos.
- No uses bloques pdf.

Tiempos (sé realista, no infles):
- durationMin de cada lección: entre 3 y 8 minutos.
- estimatedHours = suma de los minutos / 60, redondeado a un decimal.
- timeLimitMin del examen: 5 a 10 minutos.

Importante: responde únicamente con el JSON final (sin texto antes ni después).`;

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return new Response("No autorizado", { status: 403 });
  }

  const body = (await req.json()) as {
    objetivo?: string;
    material?: string;
    empresa?: string;
    categoria?: string;
  };
  const objetivo = body.objetivo?.trim();
  if (!objetivo) {
    return new Response("Describe el objetivo del curso.", { status: 400 });
  }
  const material = (body.material ?? "").trim();
  if (material.length > 60_000) {
    return new Response(
      "El material es muy largo (máx. ~60.000 caracteres). Recórtalo a lo esencial.",
      { status: 400 },
    );
  }

  const userPrompt = [
    `Objetivo del curso: ${objetivo}`,
    `Empresa: ${body.empresa ?? "AMBAS"}`,
    `Categoría: ${body.categoria ?? "FORMACION_CONTINUA"}`,
    material ? `\nMaterial de referencia:\n"""\n${material}\n"""` : "",
  ].join("\n");

  // System como bloque con cache_control: el prompt (estable entre llamadas)
  // se cachea y se cobra ~0.1x al reusarse.
  const system: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
  ];

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      // Keep-alive: por si el modelo tarda en empezar a emitir, evitamos que
      // Heroku corte la conexión por inactividad (H15) enviando un espacio cada
      // ~20 s MIENTRAS aún no empieza el JSON (detectamos el primer "{"). El
      // cliente recorta todo lo previo al primer "{" (ver AsistenteIA.tsx), así
      // que estos espacios no corrompen el borrador.
      let jsonStarted = false;
      let lastSent = Date.now();
      const heartbeat = setInterval(() => {
        if (!jsonStarted && Date.now() - lastSent > 20_000) {
          try {
            controller.enqueue(encoder.encode(" "));
            lastSent = Date.now();
          } catch {
            /* stream ya cerrado: el intervalo se limpia en finally */
          }
        }
      }, 5_000);

      try {
        const stream = anthropic.messages.stream({
          model: ASISTENTE_MODEL,
          max_tokens: 16000,
          system,
          messages: [{ role: "user", content: userPrompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            lastSent = Date.now();
            controller.enqueue(encoder.encode(event.delta.text));
            if (!jsonStarted && event.delta.text.includes("{")) {
              jsonStarted = true; // empezó el JSON: dejamos de latir
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        clearInterval(heartbeat);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
