import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Award,
  Trophy,
  ArrowRight,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCompletedLessonIds, getPassedExamIds, pct } from "@/lib/progress";
import { visibleCoursesWhere, getViewer } from "@/lib/courses";
import { effectiveDueDate, dueStatus, type DueStatus } from "@/lib/vencimiento";
import { getLogrosGanados, BADGES } from "@/lib/badges";
import { Header } from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cardCls =
  "rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-sm dark:border-border dark:bg-card";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const firstName = session?.user?.name?.split(" ")[0] ?? "usuario";

  // El admin no usa el dashboard de alumno: su home es Reportes.
  if (session?.user?.role === "SUPER_ADMIN") redirect("/reportes");

  if (!userId) {
    return (
      <Header title={`Hola, ${firstName} 👋`} subtitle="Bienvenido a la Academia" />
    );
  }

  const [viewer, completed, passed, me, certs, logros] = await Promise.all([
    getViewer(userId),
    getCompletedLessonIds(userId),
    getPassedExamIds(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.certificate.count({ where: { userId } }),
    getLogrosGanados(userId),
  ]);

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

  type Fila = {
    id: string;
    title: string;
    p: number;
    done: number;
    total: number;
    due: DueStatus | null;
  };
  const filas: Fila[] = courses.map((c) => {
    const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const examIds = c.modules.flatMap((m) => m.exams.map((e) => e.id));
    const total = lessonIds.length + examIds.length;
    const done =
      lessonIds.filter((id) => completed.has(id)).length +
      examIds.filter((id) => passed.has(id)).length;
    const p = pct(done, total);
    const due = dueStatus(effectiveDueDate(c, me?.createdAt), p === 100);
    return { id: c.id, title: c.title, p, done, total, due };
  });

  const enProgreso = filas.filter((c) => c.p > 0 && c.p < 100);
  const completados = filas.filter((c) => c.total > 0 && c.p === 100);
  const sinEmpezar = filas.filter((c) => c.p === 0 && c.total > 0);
  const porVencer = filas.filter((c) => c.due);
  const continuar = enProgreso.length > 0 ? enProgreso : sinEmpezar;

  return (
    <div>
      <Header
        title={`Hola, ${firstName} 👋`}
        subtitle="Este es tu resumen de aprendizaje"
      />

      {/* Alertas de vencimiento */}
      {porVencer.length > 0 && (
        <div className="mb-6 rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Tienes {porVencer.length}{" "}
            {porVencer.length === 1 ? "curso por atender" : "cursos por atender"}
          </p>
          <ul className="space-y-1.5">
            {porVencer.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cursos/${c.id}`}
                  className="flex items-center justify-between gap-3 text-sm transition-colors hover:text-foreground"
                >
                  <span className="truncate text-foreground/90">{c.title}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.due!.tone === "overdue"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {c.due!.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          tint="bg-primary/10"
          value={String(enProgreso.length)}
          label="Cursos en progreso"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          tint="bg-success/10"
          value={String(completados.length)}
          label="Cursos completados"
        />
        <StatCard
          icon={<Award className="h-5 w-5 text-gold" />}
          tint="bg-gold/10"
          value={String(certs)}
          label="Certificados"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-gold" />}
          tint="bg-gold/10"
          value={`${logros.size}/${BADGES.length}`}
          label="Logros"
        />
      </div>

      {/* Continuar aprendiendo */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl text-foreground">
          <span className="h-5 w-1 rounded-full bg-gold" />
          {enProgreso.length > 0 ? "Continuar aprendiendo" : "Empieza un curso"}
        </h2>

        {filas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-16 text-center">
            <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Aún no tienes cursos asignados.
            </p>
          </div>
        ) : continuar.length === 0 ? (
          <div className={`${cardCls} flex items-center gap-3`}>
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                ¡Completaste todos tus cursos! 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                Revisa tus certificados y logros.
              </p>
            </div>
            <Link
              href="/certificados"
              className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
            >
              Certificados
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {continuar.slice(0, 5).map((c) => (
              <div key={c.id} className={`${cardCls} flex items-center gap-4`}>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate font-medium text-foreground">
                      {c.title}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                      {c.p}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${c.p}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/cursos/${c.id}`}
                  className={cn(buttonVariants(), "shrink-0 gap-1.5")}
                >
                  {c.p > 0 ? "Continuar" : "Empezar"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
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
    <div className={cardCls}>
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
