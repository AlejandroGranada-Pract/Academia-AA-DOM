import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// "Staff" = quien puede gestionar contenido: SUPER_ADMIN (todo) o AREA_LEADER
// (acotado a los grupos que lidera). Centraliza la autorización de gestión.

export type Staff = {
  id: string;
  role: "SUPER_ADMIN" | "AREA_LEADER";
  ledGroupIds: string[]; // grupos que lidera (vacío para admin)
};

// Devuelve el staff actual con sus grupos liderados, o null si no es staff.
export async function getStaff(): Promise<Staff | null> {
  const s = await auth();
  const role = s?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "AREA_LEADER") return null;
  const id = s!.user.id;
  if (role === "SUPER_ADMIN") return { id, role, ledGroupIds: [] };
  const grupos = await prisma.grupo.findMany({
    where: { lideres: { some: { id } } },
    select: { id: true },
  });
  return { id, role, ledGroupIds: grupos.map((g) => g.id) };
}

export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) throw new Error("No autorizado");
  return staff;
}

const NO_AUTORIZADO = "No autorizado";

// ¿El staff puede gestionar este curso? Admin sí; líder solo si el curso está
// asignado a alguno de sus grupos liderados.
export async function canManageCourse(
  staff: Staff,
  courseId: string,
): Promise<boolean> {
  if (staff.role === "SUPER_ADMIN") return true;
  if (staff.ledGroupIds.length === 0) return false;
  const c = await prisma.course.findFirst({
    where: { id: courseId, grupos: { some: { id: { in: staff.ledGroupIds } } } },
    select: { id: true },
  });
  return !!c;
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
