import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getStaff, canManageGrupo } from "@/lib/staff";
import { Header } from "@/components/layout/Header";
import { GrupoMembership } from "@/components/admin/GrupoMembership";

const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "AA | DOM",
};

export default async function GrupoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const staff = await getStaff();
  if (!staff) redirect("/");
  // El líder solo entra a sus grupos liderados; si no, de vuelta al listado.
  if (!canManageGrupo(staff, params.id)) redirect("/grupos");

  const grupo = await prisma.grupo.findUnique({
    where: { id: params.id },
    include: {
      courses: { select: { id: true } },
      users: { select: { id: true } },
    },
  });
  if (!grupo) notFound();

  const courseIds = new Set(grupo.courses.map((c) => c.id));
  const userIds = new Set(grupo.users.map((u) => u.id));

  const [courses, users] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, company: true },
    }),
    prisma.user.findMany({
      where: { role: { not: "SUPER_ADMIN" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <div>
      <Link
        href="/grupos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Grupos
      </Link>

      <Header
        title={grupo.name}
        subtitle="Marca los cursos y usuarios que pertenecen a este grupo, luego guarda los cambios"
      />

      <GrupoMembership
        grupoId={grupo.id}
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: COMPANY_LABEL[c.company] ?? c.company,
          member: courseIds.has(c.id),
        }))}
        users={users.map((u) => ({
          id: u.id,
          title: u.name,
          subtitle: u.email,
          member: userIds.has(u.id),
        }))}
      />
    </div>
  );
}
