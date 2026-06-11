import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { NuevoUsuarioDialog } from "@/components/admin/NuevoUsuarioDialog";
import { UsuariosTabla } from "@/components/admin/UsuariosTabla";

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const [usuarios, grupos] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        active: true,
        grupos: { select: { id: true, name: true } },
      },
    }),
    prisma.grupo.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <Header title="Usuarios" subtitle={`${usuarios.length} usuarios registrados`}>
        <NuevoUsuarioDialog grupos={grupos} />
      </Header>

      <UsuariosTabla
        grupos={grupos}
        usuarios={usuarios.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          company: u.company,
          active: u.active,
          grupoIds: u.grupos.map((g) => g.id),
          grupoNames: u.grupos.map((g) => g.name),
        }))}
      />
    </div>
  );
}
