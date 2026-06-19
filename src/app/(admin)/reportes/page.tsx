import {
  Users,
  BookOpen,
  Award,
  Target,
  GraduationCap,
  Trophy,
  Download,
  type LucideIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { getAdminMetrics } from "@/lib/metrics";
import { AvanceCursosChart } from "@/components/admin/charts/AvanceCursosChart";
import { PromedioExamenChart } from "@/components/admin/charts/PromedioExamenChart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ReportesPage() {
  const m = await getAdminMetrics();

  const avanceData = m.cursos.map((c) => ({
    curso: c.title.length > 24 ? c.title.slice(0, 22) + "…" : c.title,
    Completados: c.completados,
    "En progreso": c.enProgreso,
    "Sin iniciar": c.sinIniciar,
  }));

  const examenData = m.examenes
    .filter((e) => e.promedio != null)
    .map((e) => ({
      examen: e.title.length > 24 ? e.title.slice(0, 22) + "…" : e.title,
      promedio: e.promedio as number,
      passingScore: e.passingScore,
    }));

  return (
    <div>
      <Header title="Reportes" subtitle="Métricas globales de la academia">
        <a
          href="/api/reportes/export"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <Download className="h-4 w-4" />
          Exportar
        </a>
      </Header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icon={Users} label="Empleados activos" value={m.usuariosActivos} />
        <Kpi icon={BookOpen} label="Cursos activos" value={m.cursosActivos} />
        <Kpi
          icon={Target}
          label="Cumplimiento global"
          value={`${m.tasaFinalizacionGlobal}%`}
          accent
        />
        <Kpi
          icon={GraduationCap}
          label="Promedio exámenes"
          value={m.promedioGlobalExamenes != null ? `${m.promedioGlobalExamenes}%` : "—"}
        />
        <Kpi icon={Award} label="Certificados" value={m.certificadosEmitidos} accent />
      </div>

      {/* Gráficas */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel titulo="Avance por curso">
          <AvanceCursosChart data={avanceData} />
        </Panel>
        <Panel titulo="Promedio de puntaje por examen">
          <PromedioExamenChart data={examenData} />
        </Panel>
      </div>

      {/* Tabla resumen por curso */}
      <Panel titulo="Detalle por curso" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Curso</th>
                <th className="py-2 pr-4 font-medium">Elegibles</th>
                <th className="py-2 pr-4 font-medium">Completaron</th>
                <th className="py-2 pr-4 font-medium">Finalización</th>
                <th className="py-2 font-medium">Prom. examen</th>
              </tr>
            </thead>
            <tbody>
              {m.cursos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No hay cursos activos.
                  </td>
                </tr>
              ) : (
                m.cursos.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">
                      {c.title}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {c.elegibles}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {c.completados}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <span
                            className={`block h-full rounded-full ${c.tasaFinalizacion === 100 ? "bg-gold" : "bg-primary"}`}
                            style={{ width: `${c.tasaFinalizacion}%` }}
                          />
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {c.tasaFinalizacion}%
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {c.promedioExamen != null ? `${c.promedioExamen}%` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Ranking */}
      {m.ranking.length > 0 && (
        <Panel titulo="Top empleados por certificados" className="mt-6">
          <ol className="space-y-2">
            {m.ranking.map((r, i) => (
              <li
                key={r.userId}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? "bg-gold text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <Trophy
                  className={`h-4 w-4 ${i === 0 ? "text-gold" : "text-muted-foreground/50"}`}
                />
                <span className="flex-1 font-medium text-foreground">{r.name}</span>
                <span className="text-muted-foreground">
                  {r.certificados}{" "}
                  {r.certificados === 1 ? "certificado" : "certificados"}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-4 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm">
      <Icon className={`h-5 w-5 ${accent ? "text-gold" : "text-primary"}`} />
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({
  titulo,
  children,
  className = "",
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm ${className}`}
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg text-foreground">
        <span className="h-4 w-1 rounded-full bg-gold" />
        {titulo}
      </h3>
      {children}
    </div>
  );
}
