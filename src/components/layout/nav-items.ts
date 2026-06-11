import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Award,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Menú principal compartido por Sidebar (desktop) y MobileNav (celular).
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cursos", label: "Mis Cursos", icon: BookOpen },
  { href: "/mi-progreso", label: "Mi Progreso", icon: TrendingUp },
  { href: "/certificados", label: "Certificados", icon: Award },
];

// Resalta el ítem activo: "/" solo en la raíz, el resto por prefijo de ruta.
export function isNavItemActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
