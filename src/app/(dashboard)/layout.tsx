import { auth } from "@/auth";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { signOutAction } from "@/lib/actions/auth";

// Marco compartido de todas las páginas autenticadas.
// Desktop: Sidebar fijo a la izquierda. Celular: top bar con marca + MobileNav abajo.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBFAF8] via-background to-[#F2EEE6]">
      <Sidebar
        user={{
          name: user?.name ?? "Usuario",
          role: user?.role ?? "EMPLOYEE",
        }}
      />

      {/* Barra superior solo en celular (el Sidebar está oculto ≤768px) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-[#262626] to-grafito px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="font-heading text-base tracking-wider text-sidebar-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-4 w-px bg-white/15" />
          <span className="font-heading text-base tracking-[0.2em] text-gold">
            DOM
          </span>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </form>
      </header>

      {/* Contenido: deja espacio para el sidebar (desktop) y la barra inferior (móvil) */}
      <div className="md:pl-[260px]">
        <main className="p-5 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
