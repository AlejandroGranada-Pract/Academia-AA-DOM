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

// % de avance dado un total y cuántas completadas.
export function pct(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
