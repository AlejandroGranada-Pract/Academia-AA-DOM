import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// "Staff" = quien puede gestionar contenido: SUPER_ADMIN (todo) o AREA_LEADER
// (acotado a los grupos que lidera). Centraliza la autorización de gestión.

export type Staff = {
  id: string;
  role: "SUPER_ADMIN" | "AREA_LEADER";
  ledGroupIds: string[]; // grupos que lidera (vacío para admin)
  // Líderes que comparten alguno de sus grupos (incluido él mismo): sus cursos
  // son co-gestionables. Vacío para admin.
  coLeaderIds: string[];
};

// Devuelve el staff actual con sus grupos liderados, o null si no es staff.
export async function getStaff(): Promise<Staff | null> {
  const s = await auth();
  const role = s?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "AREA_LEADER") return null;
  const id = s!.user.id;
  if (role === "SUPER_ADMIN") {
    return { id, role, ledGroupIds: [], coLeaderIds: [] };
  }
  const grupos = await prisma.grupo.findMany({
    where: { lideres: { some: { id } } },
    select: { id: true, lideres: { select: { id: true, role: true } } },
  });
  const coLeaderIds = new Set([id]);
  for (const g of grupos) {
    for (const l of g.lideres) if (l.role === "AREA_LEADER") coLeaderIds.add(l.id);
  }
  return {
    id,
    role,
    ledGroupIds: grupos.map((g) => g.id),
    coLeaderIds: Array.from(coLeaderIds),
  };
}

// Cursos que el staff puede gestionar (editar, publicar, borrar). Para el líder:
// cursos de sus grupos creados por él o por otro líder de esos grupos. Asignar un
// curso ajeno (p. ej. del admin) a su grupo lo hace visible al equipo, pero NO
// lo vuelve gestionable: el vínculo curso↔grupo lo puede escribir el propio
// líder, así que no puede ser la fuente de autoridad.
export function manageableCoursesWhere(
  staff: Staff,
): Prisma.CourseWhereInput | undefined {
  if (staff.role === "SUPER_ADMIN") return undefined;
  return {
    grupos: { some: { id: { in: staff.ledGroupIds } } },
    createdBy: { in: staff.coLeaderIds },
  };
}

export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) throw new Error("No autorizado");
  return staff;
}

const NO_AUTORIZADO = "No autorizado";

// ¿El staff puede gestionar este curso? Admin sí; líder según manageableCoursesWhere.
export async function canManageCourse(
  staff: Staff,
  courseId: string,
): Promise<boolean> {
  if (staff.role === "SUPER_ADMIN") return true;
  if (staff.ledGroupIds.length === 0) return false;
  const c = await prisma.course.findFirst({
    where: { id: courseId, ...manageableCoursesWhere(staff) },
    select: { id: true },
  });
  return !!c;
}

// Vista previa "como estudiante" (?preview=1): salta estado, visibilidad y
// secuencia, y en exámenes muestra la clave de respuestas. Solo para quien
// gestiona el curso (admin, o líder con canManageCourse), igual que el único
// punto de entrada de la UI (la página de edición).
export async function canPreviewCourse(
  courseId: string | null | undefined,
): Promise<boolean> {
  if (!courseId) return false;
  const staff = await getStaff();
  return !!staff && (await canManageCourse(staff, courseId));
}

// ¿El staff puede gestionar este grupo? Admin sí; líder solo los que lidera.
export function canManageGrupo(staff: Staff, grupoId: string): boolean {
  return staff.role === "SUPER_ADMIN" || staff.ledGroupIds.includes(grupoId);
}

// ----- Asserts para usar en server actions (lanzan si no autoriza) -----
// Resuelven el ítem hasta su curso y verifican propiedad, así un líder no puede
// tocar contenido de cursos ajenos ni pasando ids por su cuenta.

export async function assertCourse(courseId: string): Promise<Staff> {
  const staff = await requireStaff();
  if (!(await canManageCourse(staff, courseId))) throw new Error(NO_AUTORIZADO);
  return staff;
}

export async function assertModule(moduleId: string): Promise<Staff> {
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!m) throw new Error(NO_AUTORIZADO);
  return assertCourse(m.courseId);
}

export async function assertLesson(lessonId: string): Promise<Staff> {
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!l?.module) throw new Error(NO_AUTORIZADO);
  return assertCourse(l.module.courseId);
}

export async function assertExam(examId: string): Promise<Staff> {
  const e = await prisma.exam.findUnique({
    where: { id: examId },
    select: { module: { select: { courseId: true } } },
  });
  if (!e?.module) throw new Error(NO_AUTORIZADO);
  return assertCourse(e.module.courseId);
}

export async function assertQuestion(questionId: string): Promise<Staff> {
  const q = await prisma.examQuestion.findUnique({
    where: { id: questionId },
    select: { exam: { select: { module: { select: { courseId: true } } } } },
  });
  if (!q?.exam?.module) throw new Error(NO_AUTORIZADO);
  return assertCourse(q.exam.module.courseId);
}

export async function assertGrupo(grupoId: string): Promise<Staff> {
  const staff = await requireStaff();
  if (!canManageGrupo(staff, grupoId)) throw new Error(NO_AUTORIZADO);
  return staff;
}
