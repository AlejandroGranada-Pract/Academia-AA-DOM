import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type Viewer = {
  role?: string | null;
  grupoIds?: string[];
  assignedCourseIds?: string[];
};

// Datos del usuario para decidir visibilidad de cursos (rol + grupos + cursos
// asignados individualmente).
export async function getViewer(
  userId: string,
): Promise<{
  role: string;
  grupoIds: string[];
  assignedCourseIds: string[];
} | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      grupos: { select: { id: true } },
      gruposLiderados: { select: { id: true } },
      assignments: { select: { courseId: true } },
    },
  });
  if (!u) return null;
  // Grupos efectivos = a los que pertenece + los que lidera (un líder ve los
  // cursos de su grupo aunque no sea miembro).
  const grupoIds = Array.from(
    new Set([
      ...u.grupos.map((g) => g.id),
      ...u.gruposLiderados.map((g) => g.id),
    ]),
  );
  const assignedCourseIds = u.assignments.map((a) => a.courseId);
  return { role: u.role, grupoIds, assignedCourseIds };
}

// Filtro de cursos visibles:
// - SUPER_ADMIN ve todos los publicados.
// - El resto ve: Inducción (todos) + cursos de sus grupos + cursos asignados
//   individualmente (acceso directo, sin pertenecer a un grupo).
export function visibleCoursesWhere(viewer: Viewer): Prisma.CourseWhereInput {
  if (viewer.role === "SUPER_ADMIN") {
    return { status: "PUBLISHED" };
  }
  const grupoIds = viewer.grupoIds ?? [];
  const assignedCourseIds = viewer.assignedCourseIds ?? [];
  const or: Prisma.CourseWhereInput[] = [{ category: "INDUCCION" }];
  if (grupoIds.length > 0) {
    or.push({ grupos: { some: { id: { in: grupoIds } } } });
  }
  if (assignedCourseIds.length > 0) {
    or.push({ id: { in: assignedCourseIds } });
  }
  return { status: "PUBLISHED", OR: or };
}

// Misma lógica para validar el acceso a un curso puntual.
export function canSeeCourse(
  viewer: Viewer,
  course: { id: string; status: string; category: string; grupos: { id: string }[] },
): boolean {
  if (viewer.role === "SUPER_ADMIN") return true;
  if (course.status !== "PUBLISHED") return false;
  if (course.category === "INDUCCION") return true;
  if ((viewer.assignedCourseIds ?? []).includes(course.id)) return true;
  const grupoIds = new Set(viewer.grupoIds ?? []);
  return course.grupos.some((g) => grupoIds.has(g.id));
}
