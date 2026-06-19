"use client";

import { useEffect, useState } from "react";

// Colores de las gráficas (Recharts) según el tema. Recharts pinta SVG con
// atributos, no resuelve variables CSS, así que devolvemos hex concretos y
// reaccionamos al cambio de tema (clase .dark en <html>).
export type ChartTheme = {
  grid: string;
  axis: string;
  tick: string;
  tooltipBg: string;
  tooltipBorder: string;
  text: string;
};

const LIGHT: ChartTheme = {
  grid: "#0000000f",
  axis: "#999999",
  tick: "#666666",
  tooltipBg: "#ffffff",
  tooltipBorder: "#eeeeee",
  text: "#353535",
};

const DARK: ChartTheme = {
  grid: "#2a2e37",
  axis: "#5a6270",
  tick: "#9ba1ac",
  tooltipBg: "#1a1d23",
  tooltipBorder: "#2a2e37",
  text: "#ecedee",
};

export function useChartTheme(): ChartTheme {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return dark ? DARK : LIGHT;
}
