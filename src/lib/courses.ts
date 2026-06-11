import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type Viewer = { role?: string | null; grupoIds?: string[] };

// Datos del usuario para decidir visibilidad de cursos (rol + grupos).
export async function getViewer(
  userId: string,
): Promise<{ role: string; grupoIds: string[] } | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, grupos: { select: { id: true } } },
  });
  if (!u) return null;
  return { role: u.role, grupoIds: u.grupos.map((g) => g.id) };
}

// Filtro de cursos visibles:
// - SUPER_ADMIN ve todos los publicados.
// - El resto ve: Inducción (todos) + cursos de los grupos a los que pertenece.
export function visibleCoursesWhere(viewer: Viewer): Prisma.CourseWhereInput {
  if (viewer.role === "SUPER_ADMIN") {
    return { status: "PUBLISHED" };
  }
  const grupoIds = viewer.grupoIds ?? [];
  const or: Prisma.CourseWhereInput[] = [{ category: "INDUCCION" }];
  if (grupoIds.length > 0) {
    or.push({ grupos: { some: { id: { in: grupoIds } } } });
  }
  return { status: "PUBLISHED", OR: or };
}

// Misma lógica para validar el acceso a un curso puntual.
export function canSeeCourse(
  viewer: Viewer,
  course: { status: string; category: string; grupos: { id: string }[] },
): boolean {
  if (viewer.role === "SUPER_ADMIN") return true;
  if (course.status !== "PUBLISHED") return false;
  if (course.category === "INDUCCION") return true;
  const grupoIds = new Set(viewer.grupoIds ?? []);
  return course.grupos.some((g) => grupoIds.has(g.id));
}
