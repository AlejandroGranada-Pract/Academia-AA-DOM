import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, Layers, Clock, ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCompletedLessonIds, pct } from "@/lib/progress";
import { canSeeCourse, getViewer } from "@/lib/courses";
import { ModuloAccordion } from "@/components/curso/ModuloAccordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  INDUCCION: "Inducción",
  CAPACITACION_AREA: "Capacitación de área",
  FORMACION_CONTINUA: "Formación continua",
  TECNICO: "Técnico",
  PRODUCTO: "Producto",
  PROCESO: "Proceso",
};

const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "AA | DOM",
};

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function fmtFecha(d: Date) {
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default async function CursoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const curso = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      grupos: { select: { id: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          exams: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!curso || curso.status !== "PUBLISHED") notFound();

  const lessons = curso.modules.flatMap((m) => m.lessons);
  const lessonCount = lessons.length;
  const firstLesson = lessons[0];

  // Progreso del usuario en este curso
  const session = await auth();
  const userId = session?.user?.id;

  // Acceso por grupo/rol: si no le corresponde el curso, lo devolvemos al catálogo.
  const viewer = userId ? await getViewer(userId) : null;
  if (!canSeeCourse(viewer ?? {}, curso)) redirect("/cursos");

  const completedIds = userId
    ? await getCompletedLessonIds(userId)
    : new Set<string>();

  // Exámenes del curso: mejor puntaje por examen del usuario.
  const examIds = curso.modules.flatMap((m) => m.exams.map((e) => e.id));
  const attempts =
    userId && examIds.length
      ? await prisma.examAttempt.findMany({
          where: { userId, examId: { in: examIds } },
          select: { examId: true, score: true, passed: true },
        })
      : [];
  const bestByExam = new Map<string, { score: number; passed: boolean }>();
  for (const a of attempts) {
    const e = bestByExam.get(a.examId);
    if (!e || a.score > e.score) {
      bestByExam.set(a.examId, { score: a.score, passed: a.passed });
    }
  }
  const passedExamIds = new Set(
    Array.from(bestByExam.entries())
      .filter(([, v]) => v.passed)
      .map(([k]) => k),
  );

  // "Tu Rendimiento": una fila por módulo que tenga examen.
  type RendItem = { label: string; best: number | null; passed: boolean };
  const rendimiento = curso.modules
    .map((m, i): RendItem | null => {
      const ex = m.exams[0];
      if (!ex) return null;
      const b = bestByExam.get(ex.id);
      return {
        label: `Examen Mód. ${i + 1}`,
        best: b?.score ?? null,
        passed: b?.passed ?? false,
      };
    })
    .filter((r): r is RendItem => r !== null);
  const tomados = rendimiento.filter((r) => r.best != null);
  const promedio =
    tomados.length > 0
      ? Math.round(
          tomados.reduce((s, r) => s + (r.best as number), 0) / tomados.length,
        )
      : null;

  const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const coursePct = pct(doneCount, lessonCount);
  const started = doneCount > 0;

  // Bloqueo secuencial: desbloqueadas = todas hasta la primera sin completar.
  const firstIncomplete = lessons.findIndex((l) => !completedIds.has(l.id));
  const frontier = firstIncomplete === -1 ? lessons.length - 1 : firstIncomplete;
  const unlockedIds = lessons.filter((_, i) => i <= frontier).map((l) => l.id);

  // Lección donde retomar: la primera sin completar (o la primera del curso).
  const resumeLesson = lessons.find((l) => !completedIds.has(l.id)) ?? firstLesson;

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/cursos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Cursos
      </Link>

      {/* Encabezado del curso */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-grafito via-[#2a2a2a] to-grafito p-8 text-white shadow-xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
          {CATEGORY_LABEL[curso.category]} · {COMPANY_LABEL[curso.company]}
        </p>
        <h1 className="mt-2 text-4xl">{curso.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          {curso.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {curso.modules.length} módulos
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {lessonCount} lecciones
          </span>
          {curso.estimatedHours != null && (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {curso.estimatedHours} h estimadas
            </span>
          )}
        </div>

        {/* Barra de progreso del curso */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-2 max-w-md flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className={`h-full rounded-full ${coursePct === 100 ? "bg-success" : "bg-primary"}`}
              style={{ width: `${coursePct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-primary">
            {coursePct}%
          </span>
        </div>
      </div>

      {/* Contenido: módulos + barra lateral */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="mb-4 text-2xl text-foreground">Contenido del curso</h2>
          <ModuloAccordion
            courseId={curso.id}
            completedLessonIds={Array.from(completedIds)}
            unlockedLessonIds={unlockedIds}
            modules={curso.modules.map((m) => ({
              id: m.id,
              title: m.title,
              lessons: m.lessons.map((l) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                durationMin: l.durationMin,
              })),
              exam: m.exams[0]
                ? {
                    id: m.exams[0].id,
                    title: m.exams[0].title,
                    passed: passedExamIds.has(m.exams[0].id),
                  }
                : null,
            }))}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {/* Información del Curso */}
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm">
            <h3 className="mb-3 text-lg text-foreground">Información del Curso</h3>
            <dl className="space-y-2.5 text-sm">
              <InfoRow label="Empresa" value={COMPANY_LABEL[curso.company]} />
              <InfoRow label="Categoría" value={CATEGORY_LABEL[curso.category]} />
              <InfoRow
                label="Duración"
                value={
                  curso.estimatedHours != null
                    ? `${curso.estimatedHours} horas`
                    : "—"
                }
              />
              <InfoRow label="Módulos" value={String(curso.modules.length)} />
              <InfoRow label="Exámenes" value={String(examIds.length)} />
              <InfoRow label="Puntaje mín." value={`${curso.passingScore}%`} />
              <InfoRow
                label="Fecha límite"
                value={curso.dueDate ? fmtFecha(curso.dueDate) : "Sin límite"}
                valueClassName={curso.dueDate ? "text-destructive" : undefined}
              />
            </dl>

            {resumeLesson && (
              <Link
                href={`/cursos/${curso.id}/leccion/${resumeLesson.id}`}
                className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}
              >
                {started ? "Continuar curso" : "Comenzar curso"}
              </Link>
            )}
          </div>

          {/* Tu Rendimiento */}
          {rendimiento.length > 0 && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm">
              <h3 className="mb-3 text-lg text-foreground">Tu Rendimiento</h3>
              <dl className="space-y-2.5 text-sm">
                {rendimiento.map((r) => (
                  <InfoRow
                    key={r.label}
                    label={r.label}
                    value={r.best == null ? "Pendiente" : `${r.best}%`}
                    valueClassName={
                      r.best == null
                        ? "text-muted-foreground"
                        : r.passed
                          ? "text-success"
                          : "text-destructive"
                    }
                  />
                ))}
                {promedio != null && (
                  <InfoRow label="Promedio" value={`${promedio}%`} />
                )}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium text-foreground", valueClassName)}>
        {value}
      </dd>
    </div>
  );
}
