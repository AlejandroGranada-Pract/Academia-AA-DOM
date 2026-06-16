import { auth } from "@/auth";
import { getAdminMetrics } from "@/lib/metrics";

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

// Escapa un valor para CSV (comillas dobles + envoltura).
function cell(v: string | number): string {
  const s = String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return new Response("No autorizado", { status: 403 });
  }

  const m = await getAdminMetrics();

  const filas: string[] = [];
  // Sección 1: resumen por curso
  filas.push(
    ["Curso", "Empresa", "Categoría", "Elegibles", "Completaron", "En progreso", "Sin iniciar", "Finalización %", "Promedio examen %"]
      .map(cell)
      .join(","),
  );
  for (const c of m.cursos) {
    filas.push(
      [
        c.title,
        COMPANY_LABEL[c.company] ?? c.company,
        CATEGORY_LABEL[c.category] ?? c.category,
        c.elegibles,
        c.completados,
        c.enProgreso,
        c.sinIniciar,
        c.tasaFinalizacion,
        c.promedioExamen ?? "",
      ]
        .map(cell)
        .join(","),
    );
  }

  // Sección 2: exámenes
  filas.push("");
  filas.push(
    ["Examen", "Curso", "Promedio %", "Mín. aprobar %", "Intentos prom. para aprobar", "Lo presentaron"]
      .map(cell)
      .join(","),
  );
  for (const e of m.examenes) {
    filas.push(
      [
        e.title,
        e.cursoTitle,
        e.promedio ?? "",
        e.passingScore,
        e.intentosPromedioAprobar ?? "",
        e.tomado,
      ]
        .map(cell)
        .join(","),
    );
  }

  // BOM UTF-8 para que Excel respete los acentos.
  const csv = "﻿" + filas.join("\r\n");
  const fecha = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reporte-academia-${fecha}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
