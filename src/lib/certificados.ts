import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

// Un curso está "completo" cuando TODAS sus lecciones están completadas y
// TODOS sus exámenes aprobados. Mismo criterio que el avance del 100%.
export async function isCourseComplete(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
          exams: { select: { id: true } },
        },
      },
    },
  });
  if (!course) return false;

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const examIds = course.modules.flatMap((m) => m.exams.map((e) => e.id));
  // Un curso sin contenido no genera certificado.
  if (lessonIds.length === 0 && examIds.length === 0) return false;

  if (lessonIds.length > 0) {
    const done = await prisma.userProgress.count({
      where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
    });
    if (done < lessonIds.length) return false;
  }

  if (examIds.length > 0) {
    const passed = await prisma.examAttempt.findMany({
      where: { userId, examId: { in: examIds }, passed: true },
      select: { examId: true },
      distinct: ["examId"],
    });
    if (passed.length < examIds.length) return false;
  }

  return true;
}

// Código verificable, ej: CERT-2026-A1B2C3D4
function generarCodigo(): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${year}-${rand}`;
}

// Emite el certificado si el curso está completo y aún no existe.
// Idempotente y tolerante a fallos (no debe romper la acción que la invoca).
export async function issueCertificateIfComplete(
  userId: string,
  courseId: string,
): Promise<void> {
  try {
    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return;
    if (!(await isCourseComplete(userId, courseId))) return;

    await prisma.certificate.create({
      data: { userId, courseId, code: generarCodigo() },
    });
  } catch {
    // Carrera o error puntual: no interrumpimos el flujo del usuario.
  }
}
