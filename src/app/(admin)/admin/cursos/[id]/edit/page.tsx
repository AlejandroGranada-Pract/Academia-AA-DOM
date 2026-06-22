import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { CursoEditor, type ModuloEditable } from "@/components/admin/CursoEditor";
import { CursoStatusSwitch } from "@/components/admin/CursoStatusSwitch";
import { VerComoEmpleado } from "@/components/admin/VerComoEmpleado";
import type { LessonBlock } from "@/lib/actions/editor";

export default async function EditarCursoPage({
  params,
}: {
  params: { id: string };
}) {
  const curso = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          exams: { include: { questions: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });
  if (!curso) notFound();

  // Secuencia mezclada: lecciones y exámenes comparten el orden del módulo.
  const modules: ModuloEditable[] = curso.modules.map((m) => {
    const lessonItems = m.lessons.map((l) => {
      const content = l.content as { blocks?: LessonBlock[] } | null;
      return {
        kind: "lesson" as const,
        order: l.order,
        id: l.id,
        title: l.title,
        durationMin: l.durationMin,
        blocks: content?.blocks ?? [],
      };
    });
    const examItems = m.exams.map((e) => ({
      kind: "exam" as const,
      order: e.order,
      id: e.id,
      title: e.title,
      description: e.description ?? "",
      passingScore: e.passingScore,
      maxAttempts: e.maxAttempts,
      timeLimitMin: e.timeLimitMin,
      questions: e.questions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type as "MULTIPLE_CHOICE" | "MULTI_SELECT" | "TRUE_FALSE",
        options: q.options as string[],
        correctAnswer: q.correctAnswer as number | number[],
        points: q.points,
        explanation: q.explanation ?? "",
      })),
    }));
    const items = [...lessonItems, ...examItems]
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...rest }) => rest);
    return { id: m.id, title: m.title, items };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/cursos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Gestionar Cursos
      </Link>

      <Header title={curso.title} subtitle="Editor de contenido">
        <div className="flex items-center gap-4">
          <CursoStatusSwitch courseId={curso.id} status={curso.status} />
          <VerComoEmpleado courseId={curso.id} />
        </div>
      </Header>

      <CursoEditor courseId={curso.id} modules={modules} />
    </div>
  );
}
