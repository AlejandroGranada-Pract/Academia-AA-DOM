import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { NuevoUsuarioDialog } from "@/components/admin/NuevoUsuarioDialog";
import { ToggleActivo } from "@/components/admin/ToggleActivo";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  AREA_LEADER: "Líder de Área",
  EMPLOYEE: "Empleado",
  EXTERNAL: "Externo",
};
const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "AA | DOM",
};

export default async function UsuariosPage() {
  const session = await auth();
  // Solo SUPER_ADMIN puede gestionar usuarios.
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      area: true,
      active: true,
    },
  });

  return (
    <div>
      <Header title="Usuarios" subtitle={`${usuarios.length} usuarios registrados`}>
        <NuevoUsuarioDialog />
      </Header>

      <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Área</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="px-4 py-3">{COMPANY_LABEL[u.company] ?? u.company}</td>
                <td className="px-4 py-3">{u.area ?? "—"}</td>
                <td className="px-4 py-3">
                  <ToggleActivo userId={u.id} active={u.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
