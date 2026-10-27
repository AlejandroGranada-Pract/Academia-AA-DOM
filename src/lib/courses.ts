import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  buildCourseItems,
  computeUnlockedIds,
  type CourseItem,
} from "@/lib/progress";

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

// Estado de acceso del aprendiz a un curso: null si no puede verlo; si puede,
// la secuencia del curso y qué ítems tiene desbloqueados. Es la fuente única de
// autorización para páginas y server actions de aprendizaje (lecciones,
// exámenes, progreso, foro), así ninguna ruta hermana se salta las reglas.
export async function getLearnerCourseAccess(
  userId: string,
  courseId: string,
): Promise<{ items: CourseItem[]; unlockedIds: Set<string> } | null> {
  const [course, viewer] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        status: true,
        category: true,
        grupos: { select: { id: true } },
        modules: {
          orderBy: { order: "asc" },
          select: {
            lessons: { select: { id: true, order: true } },
            exams: { select: { id: true, order: true } },
          },
        },
      },
    }),
    getViewer(userId),
  ]);
  if (!course || !viewer || !canSeeCourse(viewer, course)) return null;

  const items = buildCourseItems(course.modules);
  const lessonIds = items.filter((i) => i.kind === "lesson").map((i) => i.id);
  const examIds = items.filter((i) => i.kind === "exam").map((i) => i.id);
  const [completadas, aprobados] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
      select: { lessonId: true },
    }),
    prisma.examAttempt.findMany({
      where: { userId, examId: { in: examIds }, passed: true },
      select: { examId: true },
    }),
  ]);
  const doneIds = new Set<string>([
    ...completadas.map((p) => p.lessonId),
    ...aprobados.map((a) => a.examId),
  ]);
  return { items, unlockedIds: computeUnlockedIds(items, doneIds) };
}

// Curso al que pertenece una lección / un examen (null si no existe o está suelto).
export async function courseIdOfLesson(lessonId: string): Promise<string | null> {
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  return l?.module?.courseId ?? null;
}

export async function courseIdOfExam(examId: string): Promise<string | null> {
  const e = await prisma.exam.findUnique({
    where: { id: examId },
    select: { module: { select: { courseId: true } } },
  });
  return e?.module?.courseId ?? null;
}
