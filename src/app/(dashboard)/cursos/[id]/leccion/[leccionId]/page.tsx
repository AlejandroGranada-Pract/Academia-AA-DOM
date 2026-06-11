import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCompletedLessonIds } from "@/lib/progress";
import { LeccionViewer } from "@/components/curso/LeccionViewer";
import { LeccionActions } from "@/components/curso/LeccionActions";
import { LeccionGate } from "@/components/curso/LeccionGate";

export default async function LeccionPage({
  params,
}: {
  params: { id: string; leccionId: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  // Lista plana de lecciones en orden, para anterior/siguiente y bloqueo.
  const flat = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title })),
  );
  const idx = flat.findIndex((l) => l.id === params.leccionId);
  if (idx === -1) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const completedIds = userId
    ? await getCompletedLessonIds(userId)
    : new Set<string>();

  // Frontera de avance: primera lección sin completar (todo lo anterior está abierto).
  const firstIncomplete = flat.findIndex((l) => !completedIds.has(l.id));
  const frontier = firstIncomplete === -1 ? flat.length - 1 : firstIncomplete;

  // Bloqueo secuencial: si intenta entrar a una lección más allá de la frontera, redirige.
  if (idx > frontier) {
    redirect(`/cursos/${course.id}`);
  }

  const lesson = flat[idx];
  const completed = completedIds.has(lesson.id);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <Link
        href={`/cursos/${course.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {course.title}
      </Link>

      {/* Encabezado de la lección */}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
        {lesson.moduleTitle}
      </p>
      <h1 className="mb-6 mt-1 text-3xl text-foreground">{lesson.title}</h1>

      {/* El gate coordina los videos con el botón de completar */}
      <LeccionGate>
        <LeccionViewer
          type={lesson.type}
          content={
            lesson.content as Parameters<typeof LeccionViewer>[0]["content"]
          }
        />

        {/* Completar lección (espera scroll al final + videos vistos) y volver al curso */}
        <LeccionActions
          lessonId={lesson.id}
          courseId={course.id}
          completed={completed}
        />
      </LeccionGate>
    </div>
  );
}
