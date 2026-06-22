import { auth } from "@/auth";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signOutAction } from "@/lib/actions/auth";

// Marco compartido de todas las páginas autenticadas (dashboard y admin).
// Desktop: Sidebar fijo a la izquierda. Celular: top bar con marca + MobileNav abajo.
export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-background to-[#f7f7f6] dark:from-[#0b0d10] dark:via-background dark:to-[#13161c]">
      <Sidebar
        user={{
          name: user?.name ?? "Usuario",
          role: user?.role ?? "EMPLOYEE",
        }}
      />

      {/* Barra superior solo en celular (el Sidebar está oculto ≤768px) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground dark:bg-gradient-to-r dark:from-[#14171c] dark:to-[#0f1115] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="font-heading text-base tracking-wider text-sidebar-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-4 w-px bg-sidebar-foreground/15" />
          <span className="font-heading text-base tracking-[0.2em] text-gold">
            DOM
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-destructive/15 hover:text-destructive"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      </header>

      {/* Contenido: deja espacio para el sidebar (desktop) y la barra inferior (móvil) */}
      <div className="md:pl-[260px]">
        <main className="p-5 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}
