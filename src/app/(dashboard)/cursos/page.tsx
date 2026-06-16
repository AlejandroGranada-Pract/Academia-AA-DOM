import { BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCompletedLessonIds, getPassedExamIds, pct } from "@/lib/progress";
import { visibleCoursesWhere, getViewer } from "@/lib/courses";
import { Header } from "@/components/layout/Header";
import { CursoCard } from "@/components/curso/CursoCard";

export default async function CursosPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const viewer = userId ? await getViewer(userId) : null;
  const completed = userId ? await getCompletedLessonIds(userId) : new Set<string>();
  const passedExams = userId ? await getPassedExamIds(userId) : new Set<string>();

  // Cursos visibles según el área/rol del usuario.
  const cursos = await prisma.course.findMany({
    where: visibleCoursesWhere(viewer ?? {}),
    orderBy: { createdAt: "asc" },
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
          exams: { select: { id: true } },
        },
      },
    },
  });

  return (
    <div>
      <Header
        title="Mis Cursos"
        subtitle={
          cursos.length === 1
            ? "1 curso disponible"
            : `${cursos.length} cursos disponibles`
        }
      />

      {cursos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-20 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Aún no tienes cursos asignados.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cursos.map((c) => {
            const lessonIds = c.modules.flatMap((m) =>
              m.lessons.map((l) => l.id),
            );
            const examIds = c.modules.flatMap((m) => m.exams.map((e) => e.id));
            // El avance incluye lecciones completadas + exámenes aprobados.
            const done =
              lessonIds.filter((id) => completed.has(id)).length +
              examIds.filter((id) => passedExams.has(id)).length;
            const total = lessonIds.length + examIds.length;
            return (
              <CursoCard
                key={c.id}
                course={{
                  id: c.id,
                  title: c.title,
                  description: c.description,
                  category: c.category,
                  company: c.company,
                  estimatedHours: c.estimatedHours,
                  lessonCount: lessonIds.length,
                  progressPct: pct(done, total),
                  dueDate: c.dueDate ? c.dueDate.toISOString() : null,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
