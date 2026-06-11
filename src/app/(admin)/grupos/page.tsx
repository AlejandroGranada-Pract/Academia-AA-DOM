import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { NuevoGrupoDialog } from "@/components/admin/NuevoGrupoDialog";
import { GruposLista } from "@/components/admin/GruposLista";

export default async function GruposPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const grupos = await prisma.grupo.findMany({
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
        subtitle="Define grupos (Técnico, Compras…) y asígnales cursos y usuarios"
      >
        <NuevoGrupoDialog />
      </Header>

      <GruposLista
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
