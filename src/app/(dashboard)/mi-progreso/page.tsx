import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Footprints,
  GraduationCap,
  Lock,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCompletedLessonIds, getPassedExamIds, pct } from "@/lib/progress";
import { visibleCoursesWhere, getViewer } from "@/lib/courses";
import { BADGES, getLogrosGanados, otorgarLogros } from "@/lib/badges";
import { Header } from "@/components/layout/Header";

// Mapa de íconos de los logros (las claves vienen de BADGES[].icon).
const BADGE_ICONS: Record<string, LucideIcon> = {
  Footprints,
  CheckCircle2,
  Star,
  GraduationCap,
  Flame,
  Trophy,
};

export default async function MiProgresoPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const viewer = userId ? await getViewer(userId) : null;
  const completedIds = userId
    ? await getCompletedLessonIds(userId)
    : new Set<string>();
  const passedExams = userId ? await getPassedExamIds(userId) : new Set<string>();

  const courses = await prisma.course.findMany({
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

  const cursos = courses.map((c) => {
    const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const examIds = c.modules.flatMap((m) => m.exams.map((e) => e.id));
    const total = lessonIds.length + examIds.length;
    // Avance = lecciones completadas + exámenes aprobados.
    const done =
      lessonIds.filter((id) => completedIds.has(id)).length +
      examIds.filter((id) => passedExams.has(id)).length;
    return { id: c.id, title: c.title, total, done, p: pct(done, total) };
  });

  // Exámenes: mejor puntaje por examen.
  const attempts = userId
    ? await prisma.examAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: "desc" },
        include: { exam: { select: { id: true, title: true, passingScore: true } } },
      })
    : [];
  const byExam = new Map<
    string,
    { title: string; passingScore: number; best: number; passed: boolean; count: number }
  >();
  for (const a of attempts) {
    const e = byExam.get(a.examId);
    if (!e) {
      byExam.set(a.examId, {
        title: a.exam.title,
        passingScore: a.exam.passingScore,
        best: a.score,
        passed: a.passed,
        count: 1,
      });
    } else {
      e.best = Math.max(e.best, a.score);
      e.passed = e.passed || a.passed;
      e.count += 1;
    }
  }
  const examenes = Array.from(byExam.values());

  const enProgreso = cursos.filter((c) => c.p > 0 && c.p < 100).length;
  const completados = cursos.filter((c) => c.total > 0 && c.p === 100).length;
  const promedio =
    examenes.length > 0
      ? Math.round(examenes.reduce((s, e) => s + e.best, 0) / examenes.length)
      : null;

  // Logros: otorga los pendientes (catch-up) y trae los ganados con su fecha.
  if (userId) await otorgarLogros(userId);
  const logrosGanados = userId
    ? await getLogrosGanados(userId)
    : new Map<string, Date>();
  const totalLogros = BADGES.length;
  const ganados = logrosGanados.size;

  return (
    <div>
      <Header
        title="Mi Progreso"
        subtitle="Tu avance en cursos y resultados de exámenes"
      />

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          tint="bg-primary/10"
          value={String(enProgreso)}
          label="Cursos en progreso"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          tint="bg-success/10"
          value={String(completados)}
          label="Cursos completados"
        />
        <StatCard
          icon={<GraduationCap className="h-5 w-5 text-foreground" />}
          tint="bg-muted"
          value={String(completedIds.size)}
          label="Lecciones completadas"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-gold" />}
          tint="bg-gold/10"
          value={promedio == null ? "—" : `${promedio}%`}
          label="Promedio exámenes"
        />
      </div>

      {/* Logros */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-2xl text-foreground">
          <span className="h-5 w-1 rounded-full bg-gold" />
          Logros
          <span className="text-sm font-normal text-muted-foreground">
            {ganados}/{totalLogros}
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {BADGES.map((b) => {
            const earnedAt = logrosGanados.get(b.key);
            const Icon = BADGE_ICONS[b.icon] ?? Trophy;
            const earned = !!earnedAt;
            return (
              <div
                key={b.key}
                title={b.description}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                  earned
                    ? "border-gold/40 bg-gold/10"
                    : "border-white/60 bg-white/70 opacity-60 dark:border-border dark:bg-card"
                }`}
              >
                <div
                  className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                    earned
                      ? "bg-gold/20 text-gold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {earned ? (
                    <Icon className="h-6 w-6" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{b.title}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {b.description}
                </p>
                {earned && earnedAt && (
                  <p className="mt-1 text-[10px] font-medium text-gold">
                    {fmtFecha(earnedAt)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Avance por curso */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-2xl text-foreground">
          <span className="h-5 w-1 rounded-full bg-gold" />
          Mis cursos
        </h2>
        <div className="space-y-3">
          {cursos.map((c) => (
            <Link
              key={c.id}
              href={`/cursos/${c.id}`}
              className="block rounded-xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-4 backdrop-blur-sm transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">{c.title}</span>
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                  {c.done}/{c.total} · {c.p}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${c.p === 100 ? "bg-gold" : "bg-primary"}`}
                  style={{ width: `${c.p}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Exámenes */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl text-foreground">
          <span className="h-5 w-1 rounded-full bg-gold" />
          Exámenes
        </h2>
        {examenes.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card/50 p-6 text-center text-sm text-muted-foreground">
            Aún no has presentado exámenes.
          </p>
        ) : (
          <div className="space-y-3">
            {examenes.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-4 backdrop-blur-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.count} {e.count === 1 ? "intento" : "intentos"} · aprueba con{" "}
                    {e.passingScore}%
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-heading text-2xl text-foreground">
                    {e.best}%
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      e.passed
                        ? "bg-success/15 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {e.passed ? "Aprobado" : "No aprobado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function fmtFecha(d: Date): string {
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ReactNode;
  tint: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-5 backdrop-blur-sm">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}
      >
        {icon}
      </div>
      <p className="font-heading text-3xl text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
