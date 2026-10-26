"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  CircleDashed,
  Clock,
} from "lucide-react";
import type { PersonaReporte } from "@/lib/metrics";

type Orden = "nombre" | "menorAvance" | "mayorAvance";

const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "AA | DOM",
};

function fecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function Barra({ pct }: { pct: number }) {
  const done = pct >= 100;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span
          className={`block h-full rounded-full ${done ? "bg-gold" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-xs font-semibold tabular-nums text-foreground">{pct}%</span>
    </span>
  );
}

export function ReportePersonas({ personas }: { personas: PersonaReporte[] }) {
  const [q, setQ] = useState("");
  const [orden, setOrden] = useState<Orden>("nombre");
  const [abierta, setAbierta] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    let arr = personas;
    if (t) {
      arr = personas.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.email.toLowerCase().includes(t) ||
          (p.area ?? "").toLowerCase().includes(t) ||
          p.grupos.some((g) => g.toLowerCase().includes(t)),
      );
    }
    const sorted = [...arr];
    if (orden === "nombre") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (orden === "menorAvance")
      sorted.sort((a, b) => a.avancePromedio - b.avancePromedio);
    else sorted.sort((a, b) => b.avancePromedio - a.avancePromedio);
    return sorted;
  }, [personas, q, orden]);

  function toggle(id: string) {
    setAbierta((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, correo, área o grupo…"
            className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none focus-visible:border-ring"
          />
        </div>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
        >
          <option value="nombre">Orden: Nombre</option>
          <option value="menorAvance">Orden: Menor avance</option>
          <option value="mayorAvance">Orden: Mayor avance</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {filtradas.length} de {personas.length}
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-6 py-2" />
              <th className="py-2 pr-4 font-medium">Persona</th>
              <th className="py-2 pr-4 font-medium">Área / Empresa</th>
              <th className="py-2 pr-4 font-medium">Cursos</th>
              <th className="py-2 pr-4 font-medium">Avance</th>
              <th className="py-2 pr-4 font-medium">Prom. examen</th>
              <th className="py-2 pr-4 font-medium">Certif.</th>
              <th className="py-2 font-medium">Últ. actividad</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-muted-foreground">
                  Nadie coincide con la búsqueda.
                </td>
              </tr>
            ) : (
              filtradas.map((p) => {
                const open = abierta.has(p.userId);
                return (
                  <Fragment key={p.userId}>
                    <tr
                      onClick={() => toggle(p.userId)}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2.5 pl-1 text-muted-foreground">
                        {open ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="block font-medium text-foreground">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">{p.email}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        <span className="block">{p.area || "—"}</span>
                        <span className="block text-xs">
                          {COMPANY_LABEL[p.company] ?? p.company}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground tabular-nums">
                        <span className="font-semibold text-foreground">{p.completados}</span>
                        /{p.cursosElegibles}
                        <span className="ml-1 text-xs">compl.</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Barra pct={p.avancePromedio} />
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                        {p.examenPromedio != null ? `${p.examenPromedio}%` : "—"}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                        {p.certificados}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {fecha(p.ultimaActividad)}
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b last:border-0 bg-muted/15">
                        <td />
                        <td colSpan={7} className="px-2 py-3">
                          <div className="rounded-lg border bg-card p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Detalle por curso
                              <span className="ml-2 font-normal normal-case">
                                {p.completados} completados · {p.enProgreso} en progreso ·{" "}
                                {p.sinIniciar} sin iniciar
                              </span>
                            </p>
                            {p.cursos.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No tiene cursos asignados.
                              </p>
                            ) : (
                              <ul className="space-y-1.5">
                                {p.cursos.map((c) => {
                                  const estado = c.completado
                                    ? "completado"
                                    : c.pct > 0
                                      ? "progreso"
                                      : "sin";
                                  return (
                                    <li
                                      key={c.courseId}
                                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 text-sm even:bg-muted/20"
                                    >
                                      {estado === "completado" ? (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                      ) : estado === "progreso" ? (
                                        <Clock className="h-4 w-4 shrink-0 text-primary" />
                                      ) : (
                                        <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      )}
                                      <span className="min-w-[180px] flex-1 font-medium text-foreground">
                                        {c.title}
                                      </span>
                                      <Barra pct={c.pct} />
                                      <span className="w-28 text-xs text-muted-foreground">
                                        Examen:{" "}
                                        {c.examenPromedio != null ? `${c.examenPromedio}%` : "—"}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
