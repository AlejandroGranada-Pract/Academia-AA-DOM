import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStaff } from "@/lib/staff";
import { Header } from "@/components/layout/Header";
import { NuevoGrupoDialog } from "@/components/admin/NuevoGrupoDialog";
import { GruposLista } from "@/components/admin/GruposLista";

export default async function GruposPage() {
  const staff = await getStaff();
  if (!staff) redirect("/");
  const isSuperAdmin = staff.role === "SUPER_ADMIN";

  // El admin ve todos los grupos; el líder solo los que lidera.
  const grupos = await prisma.grupo.findMany({
    where: isSuperAdmin ? undefined : { id: { in: staff.ledGroupIds } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { courses: true, users: true } },
    },
  });

  return (
    <div>
      <Header
        title="Grupos"
        subtitle={
          isSuperAdmin
            ? "Define grupos (Técnico, Compras…) y asígnales cursos y usuarios"
            : "Gestiona los miembros y cursos de tus grupos"
        }
      >
        {isSuperAdmin && <NuevoGrupoDialog />}
      </Header>

      <GruposLista
        isSuperAdmin={isSuperAdmin}
        grupos={grupos.map((g) => ({
          id: g.id,
          name: g.name,
          courses: g._count.courses,
          users: g._count.users,
        }))}
      />
    </div>
  );
}
