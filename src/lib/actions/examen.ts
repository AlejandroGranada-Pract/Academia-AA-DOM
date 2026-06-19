"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfComplete } from "@/lib/certificados";
import { otorgarLogros, titulosLogros } from "@/lib/badges";

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

// Califica el examen en el servidor y guarda el intento.
export async function submitExam(
  examId: string,
  answers: Answers,
): Promise<ExamResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "No autenticado." };

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: { orderBy: { order: "asc" } },
      module: { select: { courseId: true } },
    },
  });
  if (!exam) return { ok: false, error: "Examen no encontrado." };

  const attemptCount = await prisma.examAttempt.count({
    where: { userId, examId },
  });
  if (attemptCount >= exam.maxAttempts) {
    return { ok: false, error: "Ya no tienes intentos disponibles." };
  }

  let earnedTotal = 0;
  let total = 0;
  const results: ResultadoPregunta[] = exam.questions.map((q) => {
    total += q.points;
    const correct = q.correctAnswer as number | number[];
    const ua = answers[q.id] ?? null;

    let earned = 0;
    if (Array.isArray(correct)) {
      // Selección múltiple: crédito parcial proporcional.
      // (correctas marcadas − incorrectas marcadas) / total correctas, mínimo 0.
      const sel = Array.isArray(ua) ? ua : [];
      const correctSel = sel.filter((i) => correct.includes(i)).length;
      const incorrectSel = sel.filter((i) => !correct.includes(i)).length;
      const frac = Math.max(0, (correctSel - incorrectSel) / correct.length);
      earned = Math.round(q.points * frac * 100) / 100;
    } else {
      // Opción única / V-F: todo o nada.
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

  await prisma.examAttempt.create({
    data: {
      userId,
      examId,
      score,
      passed,
      answers: answers as object,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  // Si aprobó y con eso completó el curso, emite el certificado.
  if (passed && exam.module?.courseId) {
    await issueCertificateIfComplete(userId, exam.module.courseId);
  }
  // Otorga logros (puntaje perfecto, primer examen, racha, curso completo...).
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
