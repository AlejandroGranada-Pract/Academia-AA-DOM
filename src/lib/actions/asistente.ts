"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Borrador generado por el asistente (forma que produce el prompt).
export type DraftBlock = {
  type: "heading" | "paragraph" | "list" | "callout" | "video" | "image";
  text?: string;
  items?: string[];
  style?: "info" | "tip" | "warning";
  url?: string;
  caption?: string;
};

export type DraftCourse = {
  title: string;
  description: string;
  estimatedHours?: number;
  modules: {
    title: string;
    lessons: {
      title: string;
      durationMin?: number;
      imageQuery?: string; // término (inglés) para buscar foto en Wikimedia Commons
      blocks: DraftBlock[];
    }[];
    exam?: {
      title: string;
      description?: string;
      passingScore?: number;
      maxAttempts?: number;
      timeLimitMin?: number | null;
      questions: {
        question: string;
        type: "MULTIPLE_CHOICE" | "MULTI_SELECT" | "TRUE_FALSE";
        options: string[];
        correctAnswer: number | number[];
        points?: number;
        explanation?: string;
      }[];
    } | null;
  }[];
};

// Busca fotos libres en Wikimedia Commons (API pública, sin key) y devuelve
// hasta 5 URLs candidatas de upload.wikimedia.org, ordenadas por relevancia.
async function buscarImagenesCommons(query: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: `filetype:bitmap ${query}`,
      gsrnamespace: "6", // archivos
      gsrlimit: "5",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "1024", // miniatura razonable, no el original gigante
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      signal: AbortSignal.timeout(8000),
      headers: {
        // Wikimedia exige un User-Agent identificable; sin él responde HTML de error.
        "User-Agent":
          "AcademiaAADOM/1.0 (plataforma interna de formacion; contacto@ambienteazul.com.co)",
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { index?: number; imageinfo?: { url?: string; thumburl?: string }[] }> };
    };
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];
    pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
    const urls: string[] = [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      const url = info?.thumburl || info?.url;
      if (url && /\.(jpe?g|png|webp)/i.test(url)) urls.push(url);
    }
    return urls;
  } catch {
    return [];
  }
}

// Si la consulta exacta no da resultados, la afloja quitando la última palabra
// (ej. "hot tub filter cleaning" → "hot tub filter" → "hot tub").
async function buscarImagenesConFallback(query: string): Promise<string[]> {
  let words = query.split(/\s+/).filter(Boolean);
  for (let intento = 0; intento < 3 && words.length > 0; intento++) {
    const urls = await buscarImagenesCommons(words.join(" "));
    if (urls.length > 0) return urls;
    words = words.slice(0, -1);
  }
  return [];
}

// Si la IA no mandó imageQuery, deriva un término de búsqueda del título.
const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "y", "o", "u", "en", "del", "al", "a",
  "para", "con", "que", "un", "una", "unos", "unas", "su", "sus", "por",
  "como", "más", "mas", "e", "tu", "se", "lo",
]);
function consultaDesdeTitulo(titulo: string): string {
  return titulo
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 4)
    .join(" ");
}

const CATEGORIES = [
  "INDUCCION",
  "CAPACITACION_AREA",
  "FORMACION_CONTINUA",
  "TECNICO",
  "PRODUCTO",
  "PROCESO",
] as const;
const COMPANIES = ["AMBIENTE_AZUL", "DOM_DESIGN", "AMBAS"] as const;

// Crea el curso BORRADOR a partir del draft del asistente.
// El asistente nunca publica: el curso nace inactivo y el admin lo revisa.
export async function createCourseFromDraft(
  draft: DraftCourse,
  meta: { categoria: string; empresa: string },
): Promise<{ id?: string; error?: string }> {
  const s = await auth();
  if (s?.user?.role !== "SUPER_ADMIN") return { error: "No autorizado." };

  if (!draft?.title?.trim() || !Array.isArray(draft.modules) || draft.modules.length === 0) {
    return { error: "El borrador está incompleto (falta título o módulos)." };
  }

  const categoria = (CATEGORIES as readonly string[]).includes(meta.categoria)
    ? (meta.categoria as (typeof CATEGORIES)[number])
    : "FORMACION_CONTINUA";
  const empresa = (COMPANIES as readonly string[]).includes(meta.empresa)
    ? (meta.empresa as (typeof COMPANIES)[number])
    : "AMBAS";

  // Término de búsqueda por lección: el de la IA o, si falta, derivado del título.
  const queryDeLeccion = (l: { title?: string; imageQuery?: string }) =>
    l.imageQuery?.trim() || consultaDesdeTitulo(l.title ?? "");

  // Resuelve candidatas en Wikimedia Commons (en paralelo, tolerante a fallos).
  const queries = Array.from(
    new Set(
      draft.modules
        .flatMap((m) => m.lessons.map((l) => queryDeLeccion(l)))
        .filter(Boolean),
    ),
  );
  const candidatas = new Map<string, string[]>();
  await Promise.all(
    queries.map(async (q) => {
      candidatas.set(q, await buscarImagenesConFallback(q));
    }),
  );

  // Asigna evitando repetir la misma foto en varias lecciones.
  const usadas = new Set<string>();
  const elegirImagen = (q: string): string | null => {
    for (const u of candidatas.get(q) ?? []) {
      if (!usadas.has(u)) {
        usadas.add(u);
        return u;
      }
    }
    return null;
  };

  const curso = await prisma.course.create({
    data: {
      title: draft.title.trim(),
      description: (draft.description ?? "").trim() || draft.title.trim(),
      category: categoria,
      company: empresa,
      status: "DRAFT", // ← siempre borrador
      estimatedHours:
        typeof draft.estimatedHours === "number" ? draft.estimatedHours : null,
      createdBy: s.user.id,
      modules: {
        create: draft.modules.map((m, mi) => {
          const lessons = (m.lessons ?? []).map((l, li) => {
            const blocks = (l.blocks ?? []).filter((b) => {
              if (b.type === "list") return (b.items ?? []).length > 0;
              if (b.type === "video")
                return /youtube\.com|youtu\.be/.test(b.url ?? "");
              if (b.type === "image")
                // Solo Wikimedia Commons (URLs estables y libres).
                return (b.url ?? "").startsWith("https://upload.wikimedia.org/");
              return (b.text ?? "").trim().length > 0;
            });

            // Inserta la imagen resuelta (si la hay) después del primer bloque.
            const q = queryDeLeccion(l);
            const imgUrl = q ? elegirImagen(q) : null;
            if (imgUrl) {
              blocks.splice(Math.min(1, blocks.length), 0, {
                type: "image",
                url: imgUrl,
              });
            }

            return {
              title: l.title?.trim() || `Lección ${li + 1}`,
              type: "MIXED" as const,
              order: li + 1,
              durationMin:
                typeof l.durationMin === "number" ? Math.round(l.durationMin) : null,
              content: { blocks } as object,
            };
          });

          const exam = m.exam;
          return {
            title: m.title?.trim() || `Módulo ${mi + 1}`,
            order: mi + 1,
            lessons: { create: lessons },
            ...(exam && Array.isArray(exam.questions) && exam.questions.length > 0
              ? {
                  exams: {
                    create: [
                      {
                        title: exam.title?.trim() || "Evaluación",
                        description: exam.description?.trim() || null,
                        passingScore: Math.min(
                          100,
                          Math.max(0, exam.passingScore ?? 70),
                        ),
                        maxAttempts: Math.max(1, exam.maxAttempts ?? 3),
                        timeLimitMin: exam.timeLimitMin ?? null,
                        order: lessons.length + 1, // al final del módulo
                        questions: {
                          create: exam.questions.map((q, qi) => ({
                            question: q.question,
                            type: q.type,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            points: Math.max(1, q.points ?? 1),
                            explanation: q.explanation?.trim() || null,
                            order: qi + 1,
                          })),
                        },
                      },
                    ],
                  },
                }
              : {}),
          };
        }),
      },
    },
  });

  revalidatePath("/admin/cursos");
  return { id: curso.id };
}
