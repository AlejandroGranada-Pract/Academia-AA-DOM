import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getCompletedLessonIds,
  getPassedExamIds,
  buildCourseItems,
  computeUnlockedIds,
} from "@/lib/progress";
import { ExamenTomar } from "@/components/examen/ExamenTomar";
import { ExamenPreview } from "@/components/examen/ExamenPreview";
import { attemptDeadlineMs } from "@/lib/examenes";
import type { PreguntaLite } from "@/components/examen/PreguntaCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ExamenPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { preview?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;

  // Vista previa del admin: todo desbloqueado, solo lectura (no crea intentos).
  const isPreview =
    searchParams?.preview === "1" && session?.user?.role === "SUPER_ADMIN";

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      // Server Component: correctAnswer/explanation se traen aquí pero NUNCA se
      // pasan al cliente del examen real (a ExamenTomar solo va PreguntaLite con
      // id/question/type/options). Solo la vista previa del admin los usa.
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          question: true,
          type: true,
          options: true,
          correctAnswer: true,
          explanation: true,
        },
      },
      module: { include: { course: { select: { id: true, title: true } } } },
    },
  });
  if (!exam) notFound();

  const courseId = exam.module?.course.id;
  const pq = isPreview ? "?preview=1" : "";
  const courseHref = courseId ? `/cursos/${courseId}${pq}` : `/cursos${pq}`;

  // Bloqueo secuencial: el examen se desbloquea cuando todos los ítems
  // anteriores de la secuencia del curso están hechos. (En preview se omite.)
  if (courseId && !isPreview) {
    const courseModules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true, order: true } },
        exams: { select: { id: true, order: true } },
      },
    });
    const completedIds = userId
      ? await getCompletedLessonIds(userId)
      : new Set<string>();
    const passedExamIds = userId
      ? await getPassedExamIds(userId)
      : new Set<string>();
    const items = buildCourseItems(courseModules);
    const doneIds = new Set<string>([
      ...Array.from(completedIds),
      ...Array.from(passedExamIds),
    ]);
    const unlockedIds = computeUnlockedIds(items, doneIds);
    if (!unlockedIds.has(exam.id)) redirect(courseHref);
  }

  // Intentos: cuentan todos (en curso, completados y abandonados). Hay intento
  // disponible si quedan cupos o si existe uno en curso vigente para reanudar.
  const attempts = userId
    ? await prisma.examAttempt.findMany({
        where: { userId, examId: exam.id },
        select: { status: true, score: true, startedAt: true },
      })
    : [];
  const consumidos = attempts.length;
  const hayVigente = attempts.some(
    (a) =>
      a.status === "IN_PROGRESS" &&
      attemptDeadlineMs(a.startedAt, exam.timeLimitMin) > Date.now(),
  );
  const noAttemptsLeft = consumidos >= exam.maxAttempts && !hayVigente;
  const best = attempts
    .filter((a) => a.status === "COMPLETED")
    .reduce((max, a) => (a.score > max ? a.score : max), 0);

  const preguntas: PreguntaLite[] = exam.questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options as string[],
  }));

  return (
    <div className="mx-auto max-w-2xl">
      {isPreview && (
        <div className="mb-4 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
          Vista previa como estudiante · solo lectura · la respuesta correcta está
          marcada
        </div>
      )}

      <Link
        href={courseHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {exam.module?.course.title ?? "Cursos"}
      </Link>

      <h1 className="text-3xl text-foreground">{exam.title}</h1>
      {exam.description && (
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {exam.description}
        </p>
      )}

      {isPreview ? (
        <ExamenPreview
          questions={exam.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options as string[],
            correctAnswer: q.correctAnswer as number | number[],
            explanation: q.explanation ?? null,
          }))}
          passingScore={exam.passingScore}
        />
      ) : noAttemptsLeft ? (
        <div className="mt-4 rounded-2xl border bg-card p-8 text-center">
          <p className="font-heading text-5xl text-foreground">{best}%</p>
          <p className="mt-2 font-medium text-foreground">
            {best >= exam.passingScore ? "Examen aprobado" : "Sin intentos disponibles"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Usaste tus {exam.maxAttempts} intentos. Tu mejor puntaje fue {best}%.
          </p>
          <Link
            href={courseHref}
            className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
          >
            Volver al curso
          </Link>
        </div>
      ) : (
        <ExamenTomar
          exam={{
            id: exam.id,
            title: exam.title,
            passingScore: exam.passingScore,
            timeLimitMin: exam.timeLimitMin,
            maxAttempts: exam.maxAttempts,
          }}
          preguntas={preguntas}
          best={best}
          courseHref={courseHref}
        />
      )}
    </div>
  );
}
