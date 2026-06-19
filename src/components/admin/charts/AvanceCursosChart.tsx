"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "./useChartTheme";

export type AvanceRow = {
  curso: string;
  Completados: number;
  "En progreso": number;
  "Sin iniciar": number;
};

const AZUL = "#76B8E0";
const DORADO = "#BE9B60";
const GRIS = "#D4D0C8";

export function AvanceCursosChart({ data }: { data: AvanceRow[] }) {
  const t = useChartTheme();
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Sin datos de avance todavía.
      </p>
    );
  }
  // Altura adaptada al número de cursos (barras horizontales).
  const height = Math.max(180, data.length * 56 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barCategoryGap={16}
      >
        <CartesianGrid horizontal={false} stroke={t.grid} />
        <XAxis
          type="number"
          allowDecimals={false}
          fontSize={11}
          stroke={t.axis}
          tick={{ fill: t.tick }}
        />
        <YAxis
          type="category"
          dataKey="curso"
          width={150}
          fontSize={11}
          stroke={t.axis}
          tick={{ fill: t.tick }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: t.grid }}
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${t.tooltipBorder}`,
            background: t.tooltipBg,
            color: t.text,
            fontSize: 12,
          }}
          labelStyle={{ color: t.text }}
          itemStyle={{ color: t.text }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: t.text }} />
        <Bar dataKey="Completados" stackId="a" fill={DORADO} radius={[0, 0, 0, 0]} />
        <Bar dataKey="En progreso" stackId="a" fill={AZUL} />
        <Bar dataKey="Sin iniciar" stackId="a" fill={GRIS} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
