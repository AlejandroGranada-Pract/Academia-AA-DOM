import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Award,
  LayoutGrid,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Menú principal del EMPLEADO (alumno): Sidebar (desktop) y MobileNav (celular).
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cursos", label: "Mis Cursos", icon: BookOpen },
  { href: "/mi-progreso", label: "Mi Progreso", icon: TrendingUp },
  { href: "/certificados", label: "Certificados", icon: Award },
];

// El admin no toma cursos: su menú es de gestión (sin "alumno"). Su home es
// Reportes, así que no lleva un "Dashboard" propio en el bloque principal.
const ADMIN_MAIN_NAV: NavItem[] = [];

// Barra inferior del celular para el admin (atajos de gestión).
const ADMIN_MOBILE_NAV: NavItem[] = [
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/cursos", label: "Cursos", icon: LayoutGrid },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/mi-equipo", label: "Equipo", icon: Users },
];

// Navegación principal según rol (el admin no ve los ítems de alumno).
export function mainNavFor(role: string | undefined): NavItem[] {
  return role === "SUPER_ADMIN" ? ADMIN_MAIN_NAV : MAIN_NAV;
}
export function mobileNavFor(role: string | undefined): NavItem[] {
  return role === "SUPER_ADMIN" ? ADMIN_MOBILE_NAV : MAIN_NAV;
}

// Resalta el ítem activo: "/" solo en la raíz, el resto por prefijo de ruta.
export function isNavItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
