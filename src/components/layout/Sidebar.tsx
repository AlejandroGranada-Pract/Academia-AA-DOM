"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Users,
  Users2,
  LayoutGrid,
  BarChart3,
  Boxes,
  BookOpen,
  TrendingUp,
  Award,
  GraduationCap,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { MAIN_NAV, isNavItemActive } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Role = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";

type SidebarUser = {
  name: string;
  role: Role;
};

type NavLink = { href: string; label: string; icon: LucideIcon };

// Vista de alumno para el staff (sin "Dashboard": su home de alumno es el
// catálogo de cursos; el dashboard "/" es solo para empleados).
const APRENDIZAJE_NAV: NavLink[] = [
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/mi-progreso", label: "Mi Progreso", icon: TrendingUp },
  { href: "/certificados", label: "Certificados", icon: Award },
];

// Sección de administración completa (SUPER_ADMIN).
const ADMIN_NAV: NavLink[] = [
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/grupos", label: "Grupos", icon: Boxes },
  { href: "/admin/cursos", label: "Gestionar Cursos", icon: LayoutGrid },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

// Gestión del líder de área (sin Usuarios). Mi Equipo se agrega aparte si
// lidera algún grupo.
const LEADER_NAV: NavLink[] = [
  { href: "/admin/cursos", label: "Gestionar Cursos", icon: LayoutGrid },
  { href: "/grupos", label: "Grupos", icon: Boxes },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

// Rutas de cada modo, para que el toggle siga la sección donde estás.
const LEARNER_PATHS = ["/cursos", "/mi-progreso", "/certificados"];
const GESTION_PATHS = ["/usuarios", "/grupos", "/admin", "/reportes", "/mi-equipo"];
type Mode = "aprendizaje" | "gestion";
function modeForPath(pathname: string): Mode | null {
  if (LEARNER_PATHS.some((p) => pathname.startsWith(p))) return "aprendizaje";
  if (GESTION_PATHS.some((p) => pathname.startsWith(p))) return "gestion";
  return null;
}

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  AREA_LEADER: "Líder de Área",
  EMPLOYEE: "Empleado",
  EXTERNAL: "Externo",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  pathname,
  accent = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
  accent?: boolean;
}) {
  const active = isNavItemActive(href, pathname);

  const base =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors";
  let state: string;
  if (accent) {
    state = active
      ? "bg-gold/15 text-gold"
      : "text-gold/90 hover:bg-sidebar-accent hover:text-gold";
  } else {
    state = active
      ? "bg-sidebar-primary/15 text-sidebar-primary"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground";
  }

  return (
    <Link href={href} className={`${base} ${state}`}>
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  );
}

// Interruptor Cursos / Gestión (solo staff).
function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const btn = (m: Mode, label: string, Icon: LucideIcon) => {
    const active = mode === m;
    return (
      <button
        type="button"
        onClick={() => onChange(m)}
        aria-pressed={active}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
          active
            ? "bg-sidebar-primary/20 text-sidebar-primary shadow-sm"
            : "text-sidebar-foreground/55 hover:text-sidebar-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </button>
    );
  };
  return (
    <div className="mb-3 flex gap-1 rounded-lg bg-sidebar-accent/50 p-1">
      {btn("aprendizaje", "Cursos", GraduationCap)}
      {btn("gestion", "Gestión", SlidersHorizontal)}
    </div>
  );
}

export function Sidebar({
  user,
  leadsTeam,
}: {
  user: SidebarUser;
  leadsTeam: boolean;
}) {
  const pathname = usePathname();
  const isStaff = user.role === "SUPER_ADMIN" || user.role === "AREA_LEADER";

  // Modo activo del staff: sigue la sección donde estás; por defecto Gestión.
  const [mode, setMode] = useState<Mode>(() => modeForPath(pathname) ?? "gestion");
  // Al navegar, el toggle refleja la sección actual (sin pisar un cambio manual).
  useEffect(() => {
    const m = modeForPath(pathname);
    if (m) setMode(m);
  }, [pathname]);

  // Ítems de gestión según rol (+ Mi Equipo si lidera algún grupo).
  const gestion: NavLink[] = [];
  if (user.role === "SUPER_ADMIN") gestion.push(...ADMIN_NAV);
  else if (user.role === "AREA_LEADER") gestion.push(...LEADER_NAV);
  if (leadsTeam)
    gestion.push({ href: "/mi-equipo", label: "Mi Equipo", icon: Users2 });

  // Qué se muestra: empleados → su menú de alumno; staff → según el toggle.
  const items: NavLink[] = !isStaff
    ? MAIN_NAV
    : mode === "aprendizaje"
      ? APRENDIZAJE_NAV
      : gestion;

  return (
    <aside data-app-chrome className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground dark:bg-gradient-to-b dark:from-[#14171c] dark:via-sidebar dark:to-[#0b0d10] md:flex">
      {/* Marca AA | DOM */}
      <div className="px-5 pb-2 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="font-heading text-lg tracking-wider text-sidebar-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-5 w-px bg-sidebar-foreground/15" />
          <span className="font-heading text-lg tracking-[0.2em] text-gold">
            DOM
          </span>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold/80">
          Academia
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Toggle Cursos / Gestión: solo para admin y líder */}
        {isStaff && <ModeToggle mode={mode} onChange={setMode} />}

        <div className="space-y-1">
          {items.map((item) => (
            <SidebarLink key={item.href} {...item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* Usuario */}
      <div className="flex items-center gap-3 border-t border-sidebar-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-white">
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name}
          </p>
          <p className="text-xs text-sidebar-foreground/50">
            {ROLE_LABEL[user.role]}
          </p>
        </div>

        {/* Cambiar tema claro/oscuro */}
        <ThemeToggle />

        {/* Cerrar sesión (hover rojo) */}
        <form action={signOutAction}>
          <button
            type="submit"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>
    </aside>
  );
}
