import type { Prisma } from "@/generated/prisma/client";

type Viewer = { role?: string | null; area?: string | null };

// Filtro de cursos visibles para un usuario:
// - SUPER_ADMIN ve todos los publicados.
// - El resto ve: Inducción (todos) + cursos sin área requerida + cursos de su área.
export function visibleCoursesWhere(viewer: Viewer): Prisma.CourseWhereInput {
  if (viewer.role === "SUPER_ADMIN") {
    return { status: "PUBLISHED" };
  }
  const or: Prisma.CourseWhereInput[] = [
    { category: "INDUCCION" },
    { requiredAreas: { isEmpty: true } },
  ];
  if (viewer.area) {
    or.push({ requiredAreas: { has: viewer.area } });
  }
  return { status: "PUBLISHED", OR: or };
}

// Misma lógica para validar el acceso a un curso puntual.
export function canSeeCourse(
  viewer: Viewer,
  course: { status: string; category: string; requiredAreas: string[] },
): boolean {
  if (viewer.role === "SUPER_ADMIN") return true;
  if (course.status !== "PUBLISHED") return false;
  if (course.category === "INDUCCION") return true;
  if (course.requiredAreas.length === 0) return true;
  return !!viewer.area && course.requiredAreas.includes(viewer.area);
}
