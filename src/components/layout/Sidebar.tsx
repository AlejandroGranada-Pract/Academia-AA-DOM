"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Users,
  LayoutGrid,
  BarChart3,
  Boxes,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { MAIN_NAV, isNavItemActive } from "@/components/layout/nav-items";

type Role = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";

type SidebarUser = {
  name: string;
  role: Role;
};

// Sección de administración (solo SUPER_ADMIN). Estas pantallas se construyen
// en la Fase 2; por ahora los enlaces quedan listos.
const ADMIN_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/grupos", label: "Grupos", icon: Boxes },
  { href: "/admin/cursos", label: "Gestionar Cursos", icon: LayoutGrid },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];

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
      : "text-gold/90 hover:bg-white/5 hover:text-gold";
  } else {
    state = active
      ? "bg-sidebar-primary/15 text-sidebar-primary"
      : "text-white/65 hover:bg-white/5 hover:text-white";
  }

  return (
    <Link href={href} className={`${base} ${state}`}>
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const isAdmin = user.role === "SUPER_ADMIN";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/5 bg-gradient-to-b from-[#262626] via-sidebar to-[#161616] text-sidebar-foreground md:flex">
      {/* Marca AA | DOM */}
      <div className="px-5 pb-2 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="font-heading text-lg tracking-wider text-sidebar-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-5 w-px bg-white/15" />
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
        <div className="space-y-1">
          {MAIN_NAV.map((item) => (
            <SidebarLink key={item.href} {...item} pathname={pathname} />
          ))}
        </div>

        {isAdmin && (
          <>
            <p className="px-3 pb-2 pt-5 text-[10px] uppercase tracking-[0.15em] text-white/30">
              Administración
            </p>
            <div className="space-y-1">
              {ADMIN_NAV.map((item) => (
                <SidebarLink key={item.href} {...item} pathname={pathname} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Usuario */}
      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-white">
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-white/40">{ROLE_LABEL[user.role]}</p>
        </div>

        {/* Cerrar sesión (hover rojo) */}
        <form action={signOutAction}>
          <button
            type="submit"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>
    </aside>
  );
}
