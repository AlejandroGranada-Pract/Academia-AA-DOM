"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Botón claro/oscuro. Alterna la clase .dark en <html> y persiste en
// localStorage. Pensado para usarse sobre el chrome grafito (sidebar / barra
// móvil): los estilos por defecto son claros sobre fondo oscuro.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* almacenamiento bloqueado: el cambio aplica solo en esta sesión */
    }
    setDark(next);
  }

  const base =
    "flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground";

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Modo claro" : "Modo oscuro"}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={`${base} ${className}`}
    >
      {/* Antes de montar mostramos un ícono estable para no romper la hidratación */}
      {mounted && dark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
