import { prisma } from "@/lib/db";

// ============================================================================
// Gamificación — catálogo de logros (insignias)
// El catálogo vive aquí (en código); la tabla UserBadge solo guarda cuáles ganó
// cada usuario. `icon` es el nombre de un ícono de lucide-react que la vista mapea.
// ============================================================================

export type BadgeDef = {
  key: string;
  title: string;
  description: string;
  icon: string; // nombre de ícono lucide (ver mapa en la vista)
};

export const BADGES: BadgeDef[] = [
  {
    key: "primera_leccion",
    title: "Primeros pasos",
    description: "Completaste tu primera lección.",
    icon: "Footprints",
  },
  {
    key: "examen_aprobado",
    title: "Aprobado",
    description: "Aprobaste tu primer examen.",
    icon: "CheckCircle2",
  },
  {
    key: "puntaje_perfecto",
    title: "Puntaje perfecto",
    description: "Sacaste 100% en un examen.",
    icon: "Star",
  },
  {
    key: "primer_curso",
    title: "Primer curso",
    description: "Completaste tu primer curso.",
    icon: "GraduationCap",
  },
  {
    key: "racha_7",
    title: "Racha de 7 días",
    description: "Estudiaste 7 días seguidos.",
    icon: "Flame",
  },
  {
    key: "tres_cursos",
    title: "Imparable",
    description: "Completaste tres cursos.",
    icon: "Trophy",
  },
];

// Títulos legibles a partir de las claves (para toasts).
const TITULOS = new Map(BADGES.map((b) => [b.key, b.title]));
export function titulosLogros(keys: string[]): string[] {
  return keys.map((k) => TITULOS.get(k) ?? k);
}

// Fecha en formato YYYY-MM-DD (UTC) para agrupar actividad por día.
function diaISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Racha máxima de días consecutivos dentro de un conjunto de días (YYYY-MM-DD).
function rachaMaxima(dias: Set<string>): number {
  if (dias.size === 0) return 0;
  const orden = Array.from(dias).sort();
  let mejor = 1;
  let actual = 1;
  for (let i = 1; i < orden.length; i++) {
    const prev = new Date(orden[i - 1] + "T00:00:00Z").getTime();
    const cur = new Date(orden[i] + "T00:00:00Z").getTime();
    const dif = Math.round((cur - prev) / 86_400_000);
    if (dif === 1) {
      actual += 1;
      mejor = Math.max(mejor, actual);
    } else if (dif > 1) {
      actual = 1;
    }
  }
  return mejor;
}

// Calcula qué logros CUMPLE el usuario ahora mismo (a partir de sus datos).
export async function evaluarLogros(userId: string): Promise<Set<string>> {
  const [lecciones, attempts, certs, progresoDias] = await Promise.all([
    prisma.userProgress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.examAttempt.findMany({
      where: { userId },
      select: { score: true, passed: true, completedAt: true },
    }),
    prisma.certificate.count({ where: { userId } }),
    prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED", completedAt: { not: null } },
      select: { completedAt: true },
    }),
  ]);

  const earned = new Set<string>();
  if (lecciones >= 1) earned.add("primera_leccion");
  if (attempts.some((a) => a.passed)) earned.add("examen_aprobado");
  if (attempts.some((a) => a.score >= 100)) earned.add("puntaje_perfecto");
  if (certs >= 1) earned.add("primer_curso");
  if (certs >= 3) earned.add("tres_cursos");

  // Racha: días distintos con actividad (lecciones completadas + exámenes).
  const dias = new Set<string>();
  for (const a of attempts) if (a.completedAt) dias.add(diaISO(a.completedAt));
  for (const p of progresoDias) if (p.completedAt) dias.add(diaISO(p.completedAt));
  if (rachaMaxima(dias) >= 7) earned.add("racha_7");

  return earned;
}

// Otorga (persiste) los logros recién cumplidos. Devuelve las claves nuevas.
// Tolerante a fallos: nunca debe romper la acción que la invoca.
export async function otorgarLogros(userId: string): Promise<string[]> {
  try {
    const earned = await evaluarLogros(userId);
    if (earned.size === 0) return [];
    const existentes = await prisma.userBadge.findMany({
      where: { userId },
      select: { key: true },
    });
    const ya = new Set(existentes.map((e) => e.key));
    const nuevas = Array.from(earned).filter((k) => !ya.has(k));
    if (nuevas.length > 0) {
      await prisma.userBadge.createMany({
        data: nuevas.map((key) => ({ userId, key })),
        skipDuplicates: true,
      });
    }
    return nuevas;
  } catch {
    return [];
  }
}

// Mapa key -> fecha en que se ganó (para mostrar en la vista de logros).
export async function getLogrosGanados(
  userId: string,
): Promise<Map<string, Date>> {
  const rows = await prisma.userBadge.findMany({
    where: { userId },
    select: { key: true, earnedAt: true },
  });
  return new Map(rows.map((r) => [r.key, r.earnedAt]));
}
