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
import { getAdminMetrics, getReportePersonas } from "@/lib/metrics";
import { AvanceCursosChart } from "@/components/admin/charts/AvanceCursosChart";
import { PromedioExamenChart } from "@/components/admin/charts/PromedioExamenChart";
import { ReportePersonas } from "@/components/admin/ReportePersonas";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ReportesPage() {
  const [m, personas] = await Promise.all([
    getAdminMetrics(),
    getReportePersonas(),
  ]);

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

      {/* Detalle por persona: cada empleado con su avance, exámenes y certificados */}
      <Panel titulo="Detalle por persona" className="mt-6">
        <ReportePersonas personas={personas} />
      </Panel>

      {/* Monitoreo: exámenes abiertos y no enviados (cuentan como intento) */}
      {m.examenes.some((e) => e.abandonados > 0) && (
        <Panel
          titulo="Exámenes abandonados (abiertos sin enviar)"
          className="mt-6"
        >
          <ul className="space-y-2">
            {m.examenes
              .filter((e) => e.abandonados > 0)
              .sort((a, b) => b.abandonados - a.abandonados)
              .map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {e.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {e.cursoTitle}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
                    {e.abandonados}{" "}
                    {e.abandonados === 1 ? "abandono" : "abandonos"}
                  </span>
                </li>
              ))}
          </ul>
        </Panel>
      )}

      {/* Monitoreo de integridad: salidas de pestaña y abandonos por persona */}
      {m.alertasIntegridad.length > 0 && (
        <Panel
          titulo="Integridad de exámenes (salidas de pestaña / abandonos)"
          className="mt-6"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Persona</th>
                  <th className="py-2 pr-4 font-medium">Examen</th>
                  <th className="py-2 pr-4 font-medium">Salió de pestaña</th>
                  <th className="py-2 pr-4 font-medium">Tiempo fuera</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                  <th className="py-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {m.alertasIntegridad.map((a, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">
                      {a.userName}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {a.examTitle}
                    </td>
                    <td className="py-2.5 pr-4">
                      {a.tabSwitches > 0 ? (
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                          {a.tabSwitches}{" "}
                          {a.tabSwitches === 1 ? "vez" : "veces"}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {a.awaySeconds > 0
                        ? `${Math.floor(a.awaySeconds / 60)}m ${a.awaySeconds % 60}s`
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.status === "ABANDONED"
                            ? "bg-warning/20 text-warning"
                            : a.status === "COMPLETED"
                              ? "bg-success/15 text-success"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.status === "ABANDONED"
                          ? "Abandonado"
                          : a.status === "COMPLETED"
                            ? "Completado"
                            : "En curso"}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {new Date(a.fecha).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Monitoreo de videos: cuánto vio cada persona de cada video */}
      {m.avanceVideos.length > 0 && (
        <Panel titulo="Avance de videos (cuánto vio cada persona)" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Persona</th>
                  <th className="py-2 pr-4 font-medium">Lección (video)</th>
                  <th className="py-2 pr-4 font-medium">Curso</th>
                  <th className="py-2 font-medium">Visto</th>
                </tr>
              </thead>
              <tbody>
                {m.avanceVideos.map((v, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">
                      {v.userName}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {v.leccion}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {v.cursoTitle}
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <span
                            className={`block h-full rounded-full ${v.pct >= 90 ? "bg-success" : "bg-primary"}`}
                            style={{ width: `${v.pct}%` }}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold ${v.pct >= 90 ? "text-success" : "text-foreground"}`}
                        >
                          {v.pct}%
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

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
