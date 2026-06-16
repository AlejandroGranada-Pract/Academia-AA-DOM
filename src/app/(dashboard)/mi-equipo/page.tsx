import { redirect } from "next/navigation";
import { Users2, Target, AlertTriangle, TrendingDown } from "lucide-react";
import { auth } from "@/auth";
import { Header } from "@/components/layout/Header";
import { getLeaderMetrics } from "@/lib/metrics";

export default async function MiEquipoPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "AREA_LEADER" && role !== "SUPER_ADMIN") redirect("/");

  const m = await getLeaderMetrics(session!.user.id);

  return (
    <div>
      <Header
        title="Mi Equipo"
        subtitle={m.area ? `Área: ${m.area}` : "Tu equipo"}
      />

      {!m.area ? (
        <p className="rounded-2xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Tu usuario no tiene un área asignada. Pídele a un administrador que la
          configure para ver a tu equipo.
        </p>
      ) : m.equipo.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No hay otros empleados en el área <strong>{m.area}</strong> todavía.
        </p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Kpi icon={Users2} label="Personas en el equipo" value={m.equipo.length} />
            <Kpi
              icon={Target}
              label="Promedio del equipo"
              value={m.promedioEquipo != null ? `${m.promedioEquipo}%` : "—"}
              accent
            />
            <Kpi
              icon={AlertTriangle}
              label="Con cursos vencidos"
              value={m.empleadosVencidos.length}
              danger={m.empleadosVencidos.length > 0}
            />
          </div>

          {/* Tabla del equipo */}
          <Panel titulo="Equipo" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Nombre</th>
                    <th className="py-2 pr-4 font-medium">Completados</th>
                    <th className="py-2 pr-4 font-medium">Pendientes</th>
                    <th className="py-2 pr-4 font-medium">Prom. puntaje</th>
                    <th className="py-2 font-medium">Vencidos</th>
                  </tr>
                </thead>
                <tbody>
                  {m.equipo.map((p) => (
                    <tr key={p.userId} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">
                        {p.name}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.completados}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.pendientes}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {p.promedio != null ? `${p.promedio}%` : "—"}
                      </td>
                      <td className="py-2.5">
                        {p.vencidos > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            {p.vencidos}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Cursos con menor finalización */}
            <Panel titulo="Cursos con menor finalización">
              {m.cursosBajaFinalizacion.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos.</p>
              ) : (
                <ul className="space-y-2.5">
                  {m.cursosBajaFinalizacion.map((c) => (
                    <li key={c.id} className="text-sm">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.title}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-foreground">
                          {c.tasa}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${c.tasa >= 70 ? "bg-success" : c.tasa >= 40 ? "bg-warning" : "bg-destructive"}`}
                          style={{ width: `${c.tasa}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {c.completados} de {c.elegibles} completaron
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Empleados con vencidos */}
            <Panel titulo="Empleados con cursos vencidos">
              {m.empleadosVencidos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nadie tiene cursos vencidos. 🎉
                </p>
              ) : (
                <ul className="space-y-2">
                  {m.empleadosVencidos.map((e) => (
                    <li
                      key={e.userId}
                      className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">{e.name}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {e.vencidos} {e.vencidos === 1 ? "vencido" : "vencidos"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
  danger,
}: {
  icon: typeof Users2;
  label: string;
  value: string | number;
  accent?: boolean;
  danger?: boolean;
}) {
  const color = danger ? "text-destructive" : accent ? "text-gold" : "text-primary";
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm">
      <Icon className={`h-5 w-5 ${color}`} />
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
      className={`rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm ${className}`}
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg text-foreground">
        <span className="h-4 w-1 rounded-full bg-gold" />
        {titulo}
      </h3>
      {children}
    </div>
  );
}
