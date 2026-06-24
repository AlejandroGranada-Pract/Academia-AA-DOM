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

// Barra inferior del líder de área: reportes, cursos y su equipo (sin Usuarios).
const LEADER_MOBILE_NAV: NavItem[] = [
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/cursos", label: "Cursos", icon: LayoutGrid },
  { href: "/mi-equipo", label: "Equipo", icon: Users },
];

// Staff = admin o líder de área: ninguno toma cursos (sin vista de alumno).
const isStaff = (role: string | undefined) =>
  role === "SUPER_ADMIN" || role === "AREA_LEADER";

// Navegación principal según rol (admin y líder no ven los ítems de alumno).
export function mainNavFor(role: string | undefined): NavItem[] {
  return isStaff(role) ? ADMIN_MAIN_NAV : MAIN_NAV;
}
export function mobileNavFor(role: string | undefined): NavItem[] {
  if (role === "SUPER_ADMIN") return ADMIN_MOBILE_NAV;
  if (role === "AREA_LEADER") return LEADER_MOBILE_NAV;
  return MAIN_NAV;
}

// Resalta el ítem activo: "/" solo en la raíz, el resto por prefijo de ruta.
export function isNavItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
