import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  BookOpen,
  Layers,
  Clock,
  ChevronLeft,
  CheckCircle2,
  Award,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getCompletedLessonIds,
  pct,
  buildCourseItems,
  computeUnlockedIds,
} from "@/lib/progress";
import { issueCertificateIfComplete } from "@/lib/certificados";
import { canSeeCourse, getViewer } from "@/lib/courses";
import type { ItemLite } from "@/components/curso/ModuloAccordion";
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
          exams: { select: { id: true, title: true, order: true } },
        },
      },
    },
  });

  if (!curso || curso.status !== "PUBLISHED") notFound();

  const lessons = curso.modules.flatMap((m) => m.lessons);
  const lessonCount = lessons.length;

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

  // "Tu Rendimiento": una fila por examen del curso.
  const allExams = curso.modules.flatMap((m) => m.exams);
  const rendimiento = allExams.map((ex) => {
    const b = bestByExam.get(ex.id);
    return {
      label: ex.title,
      best: b?.score ?? null,
      passed: b?.passed ?? false,
    };
  });
  const tomados = rendimiento.filter((r) => r.best != null);
  const promedio =
    tomados.length > 0
      ? Math.round(
          tomados.reduce((s, r) => s + (r.best as number), 0) / tomados.length,
        )
      : null;

  // Secuencia del curso (lecciones y exámenes en su orden) + desbloqueo.
  const courseItems = buildCourseItems(curso.modules);
  const doneIds = new Set<string>([
    ...Array.from(completedIds),
    ...Array.from(passedExamIds),
  ]);
  const unlockedIds = computeUnlockedIds(courseItems, doneIds);

  // Avance del curso = ítems hechos / total.
  const doneItems = courseItems.filter((it) => doneIds.has(it.id)).length;
  const totalItems = courseItems.length;
  const coursePct = pct(doneItems, totalItems);
  const started = doneItems > 0;

  // Certificado: si el curso está al 100%, asegura que exista y trae su id
  // para ofrecer la descarga aquí mismo (autorreparable para completados viejos).
  let certId: string | null = null;
  if (userId && coursePct === 100) {
    await issueCertificateIfComplete(userId, curso.id);
    const cert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: curso.id } },
      select: { id: true },
    });
    certId = cert?.id ?? null;
  }

  // Dónde retomar: el primer ítem pendiente (lección o examen).
  const resumeItem =
    courseItems.find((it) => !doneIds.has(it.id)) ?? courseItems[0];
  const resumeHref = resumeItem
    ? resumeItem.kind === "exam"
      ? `/examenes/${resumeItem.id}`
      : `/cursos/${curso.id}/leccion/${resumeItem.id}`
    : null;
  const firstHref = courseItems[0]
    ? courseItems[0].kind === "exam"
      ? `/examenes/${courseItems[0].id}`
      : `/cursos/${curso.id}/leccion/${courseItems[0].id}`
    : null;

  // Módulo que el acordeón deja abierto: el del primer ítem pendiente.
  const openModuleId =
    curso.modules.find(
      (m) =>
        m.lessons.some((l) => !doneIds.has(l.id)) ||
        m.exams.some((e) => !doneIds.has(e.id)),
    )?.id ?? curso.modules[0]?.id;

  // Módulos con su secuencia mezclada para el acordeón.
  const modulesForAccordion = curso.modules.map((m) => {
    const items: (ItemLite & { order: number })[] = [
      ...m.lessons.map((l) => ({
        kind: "lesson" as const,
        id: l.id,
        title: l.title,
        type: l.type,
        durationMin: l.durationMin,
        order: l.order,
      })),
      ...m.exams.map((e) => ({
        kind: "exam" as const,
        id: e.id,
        title: e.title,
        order: e.order,
      })),
    ].sort((a, b) => a.order - b.order);
    return {
      id: m.id,
      title: m.title,
      items: items.map(({ order: _o, ...rest }) => rest as ItemLite),
    };
  });

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
              className={`h-full rounded-full ${coursePct === 100 ? "bg-gold" : "bg-primary"}`}
              style={{ width: `${coursePct}%` }}
            />
          </div>
          <span
            className={`text-sm font-semibold ${coursePct === 100 ? "text-gold" : "text-primary"}`}
          >
            {coursePct}%
          </span>
        </div>
      </div>

      {/* Contenido: módulos + barra lateral */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-2xl text-foreground">
            <span className="h-5 w-1 rounded-full bg-gold" />
            Contenido del curso
          </h2>
          <ModuloAccordion
            courseId={curso.id}
            openModuleId={openModuleId}
            doneIds={Array.from(doneIds)}
            unlockedIds={Array.from(unlockedIds)}
            modules={modulesForAccordion}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {/* Información del Curso */}
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm">
            <h3 className="mb-3 flex items-center gap-2 text-lg text-foreground">
              <span className="h-4 w-1 rounded-full bg-gold" />
              Información del Curso
            </h3>
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

            {coursePct === 100 ? (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-gold/15 py-2.5 text-sm font-semibold text-gold">
                  <CheckCircle2 className="h-4 w-4" />
                  Curso completado
                </div>
                {certId && (
                  <a
                    href={`/api/certificados/${certId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants(), "w-full gap-1.5 bg-gold text-grafito hover:bg-gold/85")}
                  >
                    <Award className="h-4 w-4" />
                    Descargar certificado
                  </a>
                )}
                {firstHref && (
                  <Link
                    href={firstHref}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    Repasar curso
                  </Link>
                )}
              </div>
            ) : (
              resumeHref && (
                <Link
                  href={resumeHref}
                  className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}
                >
                  {started ? "Continuar curso" : "Comenzar curso"}
                </Link>
              )
            )}
          </div>

          {/* Tu Rendimiento */}
          {rendimiento.length > 0 && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm">
              <h3 className="mb-3 flex items-center gap-2 text-lg text-foreground">
                <span className="h-4 w-1 rounded-full bg-gold" />
                Tu Rendimiento
              </h3>
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
