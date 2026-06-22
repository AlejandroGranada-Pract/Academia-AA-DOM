"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfComplete } from "@/lib/certificados";
import { otorgarLogros, titulosLogros } from "@/lib/badges";
import { attemptDeadlineMs } from "@/lib/examenes";

export type RespuestaUsuario = number | number[] | null;
type Answers = Record<string, RespuestaUsuario>;

export type ResultadoPregunta = {
  questionId: string;
  question: string;
  type: string;
  options: string[];
  userAnswer: RespuestaUsuario;
  correctAnswer: number | number[];
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

  // 1) Cierra los en curso vencidos.
  await reapAbandonados(userId, examId, exam.timeLimitMin);

  // 2) ¿Hay uno en curso vigente? Se reanuda (no consume otro).
  const vigente = await prisma.examAttempt.findFirst({
    where: { userId, examId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
  });
  const consumidos = await prisma.examAttempt.count({
    where: { userId, examId },
  });
  if (vigente) {
    return {
      ok: true,
      attemptId: vigente.id,
      startedAt: vigente.startedAt.getTime(),
      intento: consumidos,
      maxAttempts: exam.maxAttempts,
      timeLimitMin: exam.timeLimitMin,
    };
  }

  // 3) Sin intentos disponibles.
  if (consumidos >= exam.maxAttempts) {
    return { ok: false, error: "Ya no tienes intentos disponibles." };
  }

  // 4) Nuevo intento en curso.
  const nuevo = await prisma.examAttempt.create({
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
    ok: true,
    attemptId: nuevo.id,
    startedAt: nuevo.startedAt.getTime(),
    intento: consumidos + 1,
    maxAttempts: exam.maxAttempts,
    timeLimitMin: exam.timeLimitMin,
  };
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
    select: { userId: true, examId: true, status: true },
  });
  if (!attempt || attempt.userId !== userId) {
    return { ok: false, error: "Intento no válido." };
  }
  if (attempt.status !== "IN_PROGRESS") {
    return { ok: false, error: "Este intento ya fue enviado." };
  }

  const exam = await prisma.exam.findUnique({
    where: { id: attempt.examId },
    include: {
      questions: { orderBy: { order: "asc" } },
      module: { select: { courseId: true } },
    },
  });
  if (!exam) return { ok: false, error: "Examen no encontrado." };

  let earnedTotal = 0;
  let total = 0;
  const results: ResultadoPregunta[] = exam.questions.map((q) => {
    total += q.points;
    const correct = q.correctAnswer as number | number[];
    const ua = answers[q.id] ?? null;

    let earned = 0;
    if (Array.isArray(correct)) {
      const sel = Array.isArray(ua) ? ua : [];
      const correctSel = sel.filter((i) => correct.includes(i)).length;
      const incorrectSel = sel.filter((i) => !correct.includes(i)).length;
      const frac = Math.max(0, (correctSel - incorrectSel) / correct.length);
      earned = Math.round(q.points * frac * 100) / 100;
    } else {
      earned = typeof ua === "number" && ua === correct ? q.points : 0;
    }
    earnedTotal += earned;

    return {
      questionId: q.id,
      question: q.question,
      type: q.type,
      options: q.options as string[],
      userAnswer: ua,
      correctAnswer: correct,
      isCorrect: earned === q.points,
      earned,
      explanation: q.explanation,
      points: q.points,
    };
  });

  const score = total > 0 ? Math.round((earnedTotal / total) * 100) : 0;
  const passed = score >= exam.passingScore;

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      score,
      passed,
      answers: answers as object,
      completedAt: new Date(),
    },
  });

  // Si aprobó y con eso completó el curso, emite el certificado.
  if (passed && exam.module?.courseId) {
    await issueCertificateIfComplete(userId, exam.module.courseId);
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
