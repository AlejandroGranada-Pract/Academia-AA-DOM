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
import { LeccionViewer } from "@/components/curso/LeccionViewer";
import { LeccionActions } from "@/components/curso/LeccionActions";
import { LeccionGate } from "@/components/curso/LeccionGate";
import { LeccionForo } from "@/components/curso/LeccionForo";

export default async function LeccionPage({
  params,
  searchParams,
}: {
  params: { id: string; leccionId: string };
  searchParams?: { preview?: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          exams: { select: { id: true, order: true } },
        },
      },
    },
  });
  if (!course) notFound();

  const flat = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleId: m.id })),
  );
  const lesson = flat.find((l) => l.id === params.leccionId);
  if (!lesson) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const completedIds = userId
    ? await getCompletedLessonIds(userId)
    : new Set<string>();
  const passedExamIds = userId
    ? await getPassedExamIds(userId)
    : new Set<string>();

  // Vista previa de staff (admin/líder): todo desbloqueado, sin escribir progreso.
  const isPreview =
    searchParams?.preview === "1" &&
    (session?.user?.role === "SUPER_ADMIN" ||
      session?.user?.role === "AREA_LEADER");
  const pq = isPreview ? "?preview=1" : "";

  // Bloqueo secuencial sobre la secuencia mezclada (lecciones + exámenes):
  // si la lección no está desbloqueada, vuelve al curso.
  const items = buildCourseItems(course.modules);
  const doneIds = new Set<string>([
    ...Array.from(completedIds),
    ...Array.from(passedExamIds),
  ]);
  const unlockedIds = computeUnlockedIds(items, doneIds);
  if (!isPreview && !unlockedIds.has(lesson.id)) {
    redirect(`/cursos/${course.id}`);
  }

  // Siguiente ítem de la secuencia (lección o examen) para el botón "Continuar".
  const idxActual = items.findIndex(
    (it) => it.kind === "lesson" && it.id === lesson.id,
  );
  const next = idxActual >= 0 ? items[idxActual + 1] : undefined;
  const nextHref = next
    ? next.kind === "exam"
      ? `/examenes/${next.id}${pq}`
      : `/cursos/${course.id}/leccion/${next.id}${pq}`
    : null;

  const completed = completedIds.has(lesson.id);

  // Foro de la lección: preguntas raíz con sus respuestas.
  const comentariosRaw = await prisma.lessonComment.findMany({
    where: { lessonId: lesson.id, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, role: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, role: true } } },
      },
    },
  });
  const comentarios = comentariosRaw.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    author: { id: c.user.id, name: c.user.name, role: c.user.role },
    replies: c.replies.map((r) => ({
      id: r.id,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      author: { id: r.user.id, name: r.user.name, role: r.user.role },
    })),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      {isPreview && (
        <div className="mb-4 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
          Vista previa como estudiante · tu progreso no se guarda
        </div>
      )}

      {/* Breadcrumb */}
      <Link
        href={`/cursos/${course.id}${pq}`}
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
          preview={isPreview}
          moduleId={lesson.moduleId}
          nextHref={nextHref}
        />
      </LeccionGate>

      {/* Foro: preguntas y comentarios de la lección */}
      <LeccionForo
        lessonId={lesson.id}
        courseId={course.id}
        currentUserId={userId ?? null}
        isAdmin={session?.user?.role === "SUPER_ADMIN"}
        comments={comentarios}
      />
    </div>
  );
}
