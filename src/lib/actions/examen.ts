"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfComplete } from "@/lib/certificados";
import { otorgarLogros, titulosLogros } from "@/lib/badges";
import { attemptDeadlineMs } from "@/lib/examenes";
import { courseIdOfExam, getLearnerCourseAccess } from "@/lib/courses";

// Margen tras el tiempo límite para aceptar el envío automático del cliente
// (latencia de red / reloj). Pasado esto, el intento cuenta como abandonado.
const GRACIA_ENVIO_MS = 2 * 60_000;

// ¿El usuario puede presentar este examen? Curso visible y examen desbloqueado
// en la secuencia. Devuelve el courseId o null.
async function examenAccesible(
  userId: string,
  examId: string,
): Promise<string | null> {
  const courseId = await courseIdOfExam(examId);
  if (!courseId) return null;
  const acceso = await getLearnerCourseAccess(userId, courseId);
  return acceso?.unlockedIds.has(examId) ? courseId : null;
}

export type RespuestaUsuario = number | number[] | null;
type Answers = Record<string, RespuestaUsuario>;

export type ResultadoPregunta = {
  questionId: string;
  question: string;
  type: string;
  options: string[];
  userAnswer: RespuestaUsuario;
  // null mientras al usuario le queden intentos y no haya aprobado: la clave
  // no se revela para no regalar las respuestas del siguiente intento.
  correctAnswer: number | number[] | null;
  isCorrect: boolean; // true solo si obtuvo el puntaje completo
  earned: number; // puntos obtenidos (puede ser parcial)
  explanation: string | null;
  points: number;
};

export type ExamResult =
  | { ok: false; error: string }
  | {
      ok: true;
      score: number;
      passed: boolean;
      passingScore: number;
      results: ResultadoPregunta[];
      nuevasInsignias: string[];
    };

export type IniciarResult =
  | {
      ok: true;
      attemptId: string;
      startedAt: number; // ms (epoch) para anclar el temporizador
      intento: number; // número de intento (1..maxAttempts)
      maxAttempts: number;
      timeLimitMin: number | null;
    }
  | { ok: false; error: string };

// Marca como ABANDONED los intentos en curso ya vencidos (salirse cuenta).
async function reapAbandonados(
  userId: string,
  examId: string,
  timeLimitMin: number | null,
) {
  const enCurso = await prisma.examAttempt.findMany({
    where: { userId, examId, status: "IN_PROGRESS" },
    select: { id: true, startedAt: true },
  });
  const now = Date.now();
  for (const a of enCurso) {
    if (attemptDeadlineMs(a.startedAt, timeLimitMin) < now) {
      await prisma.examAttempt.update({
        where: { id: a.id },
        data: { status: "ABANDONED", completedAt: new Date() },
      });
    }
  }
}

// Inicia (o reanuda) un intento. El intento se registra AL ABRIR el examen,
// así salirse sin enviar igual consume y queda registrado.
export async function iniciarExamen(examId: string): Promise<IniciarResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "No autenticado." };

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { maxAttempts: true, timeLimitMin: true },
  });
  if (!exam) return { ok: false, error: "Examen no encontrado." };
  if (!(await examenAccesible(userId, examId))) {
    return { ok: false, error: "No tienes acceso a este examen." };
  }

  // 1) Cierra los en curso vencidos.
  await reapAbandonados(userId, examId, exam.timeLimitMin);

  // 2-4) Reanudar / validar cupo / crear, atómico por (usuario, examen): un lock
  // de transacción evita que llamadas concurrentes superen maxAttempts.
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`exam:${userId}:${examId}`}))`;

    // 2) ¿Hay uno en curso vigente? Se reanuda (no consume otro).
    const vigente = await tx.examAttempt.findFirst({
      where: { userId, examId, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
    });
    const consumidos = await tx.examAttempt.count({
      where: { userId, examId },
    });
    if (vigente) {
      return {
        ok: true as const,
        attemptId: vigente.id,
        startedAt: vigente.startedAt.getTime(),
        intento: consumidos,
        maxAttempts: exam.maxAttempts,
        timeLimitMin: exam.timeLimitMin,
      };
    }

    // 3) Sin intentos disponibles.
    if (consumidos >= exam.maxAttempts) {
      return { ok: false as const, error: "Ya no tienes intentos disponibles." };
    }

    // 4) Nuevo intento en curso.
    const nuevo = await tx.examAttempt.create({
      data: {
        userId,
        examId,
        status: "IN_PROGRESS",
        score: 0,
        passed: false,
        answers: {},
        startedAt: new Date(),
      },
    });
    return {
      ok: true as const,
      attemptId: nuevo.id,
      startedAt: nuevo.startedAt.getTime(),
      intento: consumidos + 1,
      maxAttempts: exam.maxAttempts,
      timeLimitMin: exam.timeLimitMin,
    };
  });
}

// Marca un intento en curso como ABANDONED (el usuario salió sin enviar).
// Idempotente: solo afecta si el intento es del usuario y sigue en curso.
export async function abandonarExamen(attemptId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.examAttempt.updateMany({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
    data: { status: "ABANDONED", completedAt: new Date() },
  });
}

// Registra que el usuario salió de la pestaña durante un examen en curso
// (integridad). Suma 1 al contador. Idempotente por intento/estado.
export async function registrarSalidaPestana(attemptId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await prisma.examAttempt.updateMany({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
    data: { tabSwitches: { increment: 1 } },
  });
}

// Suma los segundos que el usuario estuvo fuera de la pestaña (al volver).
export async function registrarTiempoFuera(
  attemptId: string,
  seconds: number,
): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  const secs = Math.max(0, Math.round(seconds));
  if (secs === 0) return;
  await prisma.examAttempt.updateMany({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
    data: { awaySeconds: { increment: secs } },
  });
}

// Califica el examen en el servidor y cierra el intento en curso.
export async function submitExam(
  attemptId: string,
  answers: Answers,
): Promise<ExamResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "No autenticado." };

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    select: { userId: true, examId: true, status: true, startedAt: true },
  });
  if (!attempt || attempt.userId !== userId) {
    return { ok: false, error: "Intento no válido." };
  }
  if (attempt.status !== "IN_PROGRESS") {
    return { ok: false, error: "Este intento ya fue enviado." };
  }

  const courseId = await examenAccesible(userId, attempt.examId);
  if (!courseId) return { ok: false, error: "No tienes acceso a este examen." };

  const exam = await prisma.exam.findUnique({
    where: { id: attempt.examId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exam) return { ok: false, error: "Examen no encontrado." };

  // Tiempo límite en el servidor (el temporizador del cliente no es un control).
  if (Date.now() > attemptDeadlineMs(attempt.startedAt, exam.timeLimitMin) + GRACIA_ENVIO_MS) {
    await prisma.examAttempt.updateMany({
      where: { id: attemptId, userId, status: "IN_PROGRESS" },
      data: { status: "ABANDONED", completedAt: new Date() },
    });
    return { ok: false, error: "El tiempo del examen terminó." };
  }

  let earnedTotal = 0;
  let total = 0;
  const graded = exam.questions.map((q) => {
    total += q.points;
    const correct = q.correctAnswer as number | number[];
    const nOpts = Array.isArray(q.options) ? q.options.length : 0;
    const valido = (i: unknown): i is number =>
      Number.isInteger(i) && (i as number) >= 0 && (i as number) < nOpts;
    const raw = answers?.[q.id] ?? null;

    let earned = 0;
    let ua: RespuestaUsuario = null;
    if (Array.isArray(correct)) {
      // Selección múltiple: índices únicos y dentro del rango de opciones, y
      // la fracción acotada a [0, 1] (sin esto, repetir un índice correcto
      // inflaba la nota por encima del 100%).
      const sel = Array.isArray(raw) ? Array.from(new Set(raw.filter(valido))) : [];
      ua = sel;
      const correctSel = sel.filter((i) => correct.includes(i)).length;
      const incorrectSel = sel.length - correctSel;
      const frac =
        correct.length > 0
          ? Math.min(1, Math.max(0, (correctSel - incorrectSel) / correct.length))
          : 0;
      earned = Math.round(q.points * frac * 100) / 100;
    } else {
      ua = valido(raw) ? raw : null;
      earned = ua === correct ? q.points : 0;
    }
    earnedTotal += earned;
    return { q, correct, ua, earned };
  });

  const score =
    total > 0 ? Math.min(100, Math.round((earnedTotal / total) * 100)) : 0;
  const passed = score >= exam.passingScore;
  const respuestasGuardadas = Object.fromEntries(graded.map((g) => [g.q.id, g.ua]));

  // Cierre atómico: solo un envío por intento.
  const cerrado = await prisma.examAttempt.updateMany({
    where: { id: attemptId, userId, status: "IN_PROGRESS" },
    data: {
      status: "COMPLETED",
      score,
      passed,
      answers: respuestasGuardadas,
      completedAt: new Date(),
    },
  });
  if (cerrado.count === 0) {
    return { ok: false, error: "Este intento ya fue enviado." };
  }

  // La clave de respuestas solo se revela si aprobó o ya no le quedan intentos.
  const usados = await prisma.examAttempt.count({
    where: { userId, examId: exam.id },
  });
  const revelar = passed || usados >= exam.maxAttempts;
  const results: ResultadoPregunta[] = graded.map(({ q, correct, ua, earned }) => ({
    questionId: q.id,
    question: q.question,
    type: q.type,
    options: q.options as string[],
    userAnswer: ua,
    correctAnswer: revelar ? correct : null,
    isCorrect: earned === q.points,
    earned,
    explanation: revelar ? q.explanation : null,
    points: q.points,
  }));

  // Si aprobó y con eso completó el curso, emite el certificado.
  if (passed) {
    await issueCertificateIfComplete(userId, courseId);
  }
  const nuevasInsignias = titulosLogros(await otorgarLogros(userId));

  revalidatePath("/");
  revalidatePath("/cursos");
  revalidatePath("/mi-progreso");
  revalidatePath("/certificados");

  return {
    ok: true,
    score,
    passed,
    passingScore: exam.passingScore,
    results,
    nuevasInsignias,
  };
}
