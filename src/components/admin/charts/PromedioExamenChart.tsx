"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "./useChartTheme";

export type ExamenRow = {
  examen: string;
  promedio: number;
  passingScore: number;
};

const VERDE = "#3a9d6b";
const ROJO = "#c0563f";

export function PromedioExamenChart({ data }: { data: ExamenRow[] }) {
  const t = useChartTheme();
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Aún nadie ha presentado exámenes.
      </p>
    );
  }
  const height = Math.max(180, data.length * 52 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
        barCategoryGap={14}
      >
        <CartesianGrid horizontal={false} stroke={t.grid} />
        <XAxis
          type="number"
          domain={[0, 100]}
          fontSize={11}
          stroke={t.axis}
          tick={{ fill: t.tick }}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="examen"
          width={150}
          fontSize={11}
          stroke={t.axis}
          tick={{ fill: t.tick }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: t.grid }}
          formatter={(value, _name, item) => {
            const row = (item as { payload?: ExamenRow }).payload;
            return [
              `${value}% (aprueba con ${row?.passingScore ?? ""}%)`,
              "Promedio",
            ];
          }}
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
        <Bar dataKey="promedio" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.promedio >= d.passingScore ? VERDE : ROJO}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
