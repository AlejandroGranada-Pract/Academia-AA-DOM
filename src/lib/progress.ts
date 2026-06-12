import { prisma } from "@/lib/db";

// Devuelve el conjunto de IDs de lecciones que el usuario ya completó.
export async function getCompletedLessonIds(
  userId: string,
): Promise<Set<string>> {
  const rows = await prisma.userProgress.findMany({
    where: { userId, status: "COMPLETED" },
    select: { lessonId: true },
  });
  return new Set(rows.map((r) => r.lessonId));
}

// Devuelve el conjunto de IDs de exámenes que el usuario ya aprobó.
export async function getPassedExamIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.examAttempt.findMany({
    where: { userId, passed: true },
    select: { examId: true },
  });
  return new Set(rows.map((r) => r.examId));
}

// % de avance dado un total y cuántas completadas.
export function pct(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ----------------------------------------------------------------------------
// Secuencia del curso: lecciones y exámenes comparten el orden dentro de cada
// módulo. Un ítem se desbloquea cuando todos los anteriores están hechos
// (lección completada / examen aprobado).
// ----------------------------------------------------------------------------

export type CourseItem = { kind: "lesson" | "exam"; id: string };

type ModuleWithOrder = {
  lessons: { id: string; order: number }[];
  exams: { id: string; order: number }[];
};

// Lista plana de ítems del curso en orden (módulos ya deben venir ordenados).
export function buildCourseItems(modules: ModuleWithOrder[]): CourseItem[] {
  return modules.flatMap((m) =>
    [
      ...m.lessons.map((l) => ({ kind: "lesson" as const, id: l.id, order: l.order })),
      ...m.exams.map((e) => ({ kind: "exam" as const, id: e.id, order: e.order })),
    ]
      .sort((a, b) => a.order - b.order)
      .map(({ kind, id }) => ({ kind, id })),
  );
}

// IDs desbloqueados: todos hasta el primer ítem pendiente (inclusive).
export function computeUnlockedIds(
  items: CourseItem[],
  doneIds: Set<string>,
): Set<string> {
  const firstPending = items.findIndex((it) => !doneIds.has(it.id));
  const frontier = firstPending === -1 ? items.length - 1 : firstPending;
  return new Set(items.slice(0, frontier + 1).map((it) => it.id));
}
