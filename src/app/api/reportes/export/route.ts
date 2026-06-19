import ExcelJS from "exceljs";
import { auth } from "@/auth";
import { getAdminMetrics } from "@/lib/metrics";

export const runtime = "nodejs";

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

// Paleta de marca (ARGB)
const GOLD = "FFBE9B60";
const GRAFITO = "FF1F1F1F";
const WHITE = "FFFFFFFF";
const GREY = "FF8A8577";
const ZEBRA = "FFF7F4ED";
const BORDER = "FFE6E1D6";

type Col = {
  header: string;
  key: string;
  width: number;
  percent?: boolean;
  numeric?: boolean;
};

const thin = { style: "thin" as const, color: { argb: BORDER } };
const allBorders = { top: thin, bottom: thin, left: thin, right: thin };

// Construye una hoja con título de marca, encabezado estilizado, zebra y filtros.
function buildSheet(
  wb: ExcelJS.Workbook,
  name: string,
  subtitle: string,
  cols: Col[],
  rows: Record<string, string | number>[],
  fecha: string,
) {
  const ws = wb.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  ws.columns = cols.map((c) => ({ key: c.key, width: c.width }));
  const nCols = cols.length;

  // Fila 1: título de marca
  ws.mergeCells(1, 1, 1, nCols);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = "ACADEMIA AA | DOM";
  titleCell.font = { name: "Arial", bold: true, size: 15, color: { argb: GOLD } };
  titleCell.alignment = { vertical: "middle" };
  ws.getRow(1).height = 26;

  // Fila 2: subtítulo + fecha
  ws.mergeCells(2, 1, 2, nCols);
  const subCell = ws.getCell(2, 1);
  subCell.value = `${subtitle}  ·  ${fecha}`;
  subCell.font = { name: "Arial", italic: true, size: 10, color: { argb: GREY } };
  ws.getRow(2).height = 16;

  // Fila 3: espaciadora
  ws.getRow(3).height = 6;

  // Fila 4: encabezados
  const headerRow = ws.getRow(4);
  cols.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c.header;
    cell.font = { name: "Arial", bold: true, size: 11, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRAFITO } };
    cell.alignment = {
      vertical: "middle",
      horizontal: c.numeric || c.percent ? "center" : "left",
    };
    cell.border = allBorders;
  });
  headerRow.height = 22;

  // Datos
  rows.forEach((r, ri) => {
    const row = ws.addRow(r);
    row.height = 18;
    row.eachCell((cell, colNumber) => {
      const col = cols[colNumber - 1];
      cell.font = { name: "Arial", size: 10, color: { argb: GRAFITO } };
      cell.border = allBorders;
      cell.alignment = {
        vertical: "middle",
        horizontal: col?.numeric || col?.percent ? "center" : "left",
      };
      if (col?.percent && typeof cell.value === "number") {
        cell.numFmt = '0"%"';
      }
      if (ri % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
      }
    });
  });

  // Filtro automático sobre el encabezado
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: nCols },
  };
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return new Response("No autorizado", { status: 403 });
  }

  const m = await getAdminMetrics();
  const fecha = new Date().toISOString().slice(0, 10);
  const wb = new ExcelJS.Workbook();
  wb.creator = "Academia AA | DOM";
  wb.created = new Date();

  buildSheet(
    wb,
    "Cursos",
    "Avance por curso",
    [
      { header: "Curso", key: "curso", width: 44 },
      { header: "Empresa", key: "empresa", width: 18 },
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Elegibles", key: "elegibles", width: 11, numeric: true },
      { header: "Completaron", key: "completados", width: 13, numeric: true },
      { header: "En progreso", key: "enProgreso", width: 13, numeric: true },
      { header: "Sin iniciar", key: "sinIniciar", width: 12, numeric: true },
      { header: "Finalización", key: "tasa", width: 13, percent: true },
      { header: "Prom. examen", key: "promExamen", width: 14, percent: true },
    ],
    m.cursos.map((c) => ({
      curso: c.title,
      empresa: COMPANY_LABEL[c.company] ?? c.company,
      categoria: CATEGORY_LABEL[c.category] ?? c.category,
      elegibles: c.elegibles,
      completados: c.completados,
      enProgreso: c.enProgreso,
      sinIniciar: c.sinIniciar,
      tasa: c.tasaFinalizacion,
      promExamen: c.promedioExamen ?? "—",
    })),
    fecha,
  );

  buildSheet(
    wb,
    "Exámenes",
    "Resultados por examen",
    [
      { header: "Examen", key: "examen", width: 40 },
      { header: "Curso", key: "curso", width: 44 },
      { header: "Promedio", key: "prom", width: 12, percent: true },
      { header: "Mín. aprobar", key: "min", width: 13, percent: true },
      { header: "Intentos prom.", key: "intentos", width: 15, numeric: true },
      { header: "Lo presentaron", key: "tomado", width: 15, numeric: true },
    ],
    m.examenes.map((e) => ({
      examen: e.title,
      curso: e.cursoTitle,
      prom: e.promedio ?? "—",
      min: e.passingScore,
      intentos: e.intentosPromedioAprobar ?? "—",
      tomado: e.tomado,
    })),
    fecha,
  );

  buildSheet(
    wb,
    "Resumen",
    "Indicadores globales",
    [
      { header: "Métrica", key: "k", width: 30 },
      { header: "Valor", key: "v", width: 16, numeric: true },
    ],
    [
      { k: "Empleados activos", v: m.usuariosActivos },
      { k: "Cursos activos", v: m.cursosActivos },
      { k: "Cumplimiento global %", v: m.tasaFinalizacionGlobal },
      { k: "Promedio exámenes %", v: m.promedioGlobalExamenes ?? "—" },
      { k: "Certificados emitidos", v: m.certificadosEmitidos },
    ],
    fecha,
  );

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte-academia-${fecha}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
