import { auth } from "@/auth";
import { Header } from "@/components/layout/Header";

// Dashboard principal (ruta "/"). Placeholder de Semana 1/2.
// El contenido real (stats, cursos en progreso, etc.) se construye más adelante.
export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] ?? "usuario";

  return (
    <div>
      <Header
        title={`Hola, ${firstName} 👋`}
        subtitle="Bienvenido a la Academia AA | DOM"
      />

      <div className="max-w-3xl space-y-4 rounded-2xl border border-white/60 bg-white/70 p-8 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.18)] backdrop-blur-sm">
        <p className="text-muted-foreground">
          Sesión iniciada correctamente. El dashboard real (estadísticas y
          cursos en progreso) llega en los próximos pasos.
        </p>

        <dl className="grid grid-cols-2 gap-3 text-sm pt-2">
          <dt className="text-muted-foreground">Correo</dt>
          <dd className="font-medium">{user?.email}</dd>
          <dt className="text-muted-foreground">Rol</dt>
          <dd className="font-medium">{user?.role}</dd>
          <dt className="text-muted-foreground">Empresa</dt>
          <dd className="font-medium">{user?.company}</dd>
        </dl>
      </div>
    </div>
  );
}
