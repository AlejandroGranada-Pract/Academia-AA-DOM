import { auth } from "@/auth";
import { anthropic, ASISTENTE_MODEL } from "@/lib/claude";

// Genera el borrador de un curso con Claude (streaming de texto).
// El asistente SOLO genera borradores: nunca publica directamente.

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
            {"type": "callout", "style": "info|tip|warning", "text": "string"},
            {"type": "video", "url": "https://www.youtube.com/watch?v=..."}
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
- El contenido ESCRITO es el núcleo del curso: cada lección debe tener mínimo 4 bloques de texto (heading, paragraph, list, callout) que enseñen el tema por sí solos. Una lección debe poder estudiarse completa aunque se le quite el video.
- Si hay material de referencia, basa el contenido en él fielmente (no inventes datos de la empresa).
- Incluye un examen en el último módulo (4 a 6 preguntas) con explicación en cada pregunta. "exam" en los demás módulos: null.
- TRUE_FALSE usa options ["Verdadero", "Falso"]. MULTI_SELECT usa correctAnswer como arreglo de índices. MULTIPLE_CHOICE usa un índice numérico. Los índices empiezan en 0.

Videos (PROCEDIMIENTO OBLIGATORIO — hazlo siempre):
1. ANTES de escribir el JSON, DEBES usar la herramienta de búsqueda web entre 2 y 4 veces para encontrar videos de YouTube sobre el tema. Usa consultas como: "<tema> tutorial youtube", "<tema> video español", "<tema> site:youtube.com".
2. De los RESULTADOS, elige 1 a 3 videos relevantes y preferiblemente cortos (en español si los hay). Copia la URL EXACTA (youtube.com/watch?v=... o youtu.be/...) tal como aparece en el resultado — jamás inventes ni modifiques un ID de video.
3. Inserta cada video como bloque {"type":"video","url":"..."} en la lección donde aporte, con un párrafo antes que lo introduzca.
- Los videos son COMPLEMENTO, nunca el contenido principal: máximo 1 video por lección y máximo 3 videos en todo el curso. La mayoría de las lecciones NO llevan video.
- El curso DEBE incluir al menos 1 video. Solo omite los videos si tras buscar no aparece NINGÚN resultado de YouTube (caso casi imposible).
- Si el resultado muestra la duración del video (ej. "12:45"), úsala para el durationMin de esa lección.

Imágenes (vía imageQuery, NO busques imágenes tú):
- NO incluyas bloques {"type":"image"}. En su lugar, CADA lección DEBE llevar el campo "imageQuery" (obligatorio, nunca lo omitas): un término corto y visual EN INGLÉS (2 a 4 palabras, ej. "hot tub filter", "swimming pool tiles", "customer service handshake") que describa una foto ilustrativa de esa lección.
- El sistema usará ese término para buscar automáticamente una imagen libre en Wikimedia Commons. Elige términos genéricos y fotografiables (objetos, lugares, acciones), no conceptos abstractos.
- No uses bloques pdf.

Tiempos (sé realista, no infles):
- Lección SIN video: durationMin entre 3 y 8 minutos.
- Lección CON video: la duración del video manda. Prefiere videos CORTOS (menos de 10 min). Toma la duración REAL del video de los resultados de búsqueda (suele aparecer, ej. "12:45" = 13 min) y pon durationMin = duración del video + 2 o 3 min de lectura. Si la duración no aparece en los resultados y no puedes estimarla, mejor no uses ese video.
- Nunca pongas un durationMin menor que la duración del video que incluiste.
- estimatedHours = suma de los minutos / 60, redondeado a un decimal.
- timeLimitMin del examen: 5 a 10 minutos.

Importante: realiza las búsquedas en silencio y responde únicamente con el JSON final (sin texto antes ni después).`;

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
    `\nRecuerda el procedimiento: PRIMERO busca en la web videos de YouTube sobre este tema (2-4 búsquedas) y DESPUÉS escribe el JSON incluyendo al menos 1 video real de los resultados.`,
  ].join("\n");

  const stream = anthropic.messages.stream({
    model: ASISTENTE_MODEL,
    max_tokens: 16000,
    // System como bloque con cache_control: el prompt (estable entre llamadas)
    // y la definición de herramientas se cachean y se cobran ~0.1x al reusarse.
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    // Búsqueda web (server-side): permite encontrar videos de YouTube e
    // imágenes de Wikimedia REALES. max_uses limita costo y tiempo.
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
    messages: [{ role: "user", content: userPrompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          } else if (
            event.type === "content_block_start" &&
            event.content_block.type === "server_tool_use"
          ) {
            // Mantiene vivo el panel mientras Claude busca en la web.
            controller.enqueue(encoder.encode("\n🔎 Buscando videos e imágenes en la web…\n"));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
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
