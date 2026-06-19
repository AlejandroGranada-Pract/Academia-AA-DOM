import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { NuevoUsuarioDialog } from "@/components/admin/NuevoUsuarioDialog";
import { UsuariosTabla } from "@/components/admin/UsuariosTabla";

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const [usuarios, grupos, cursos] = await Promise.all([
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
        gruposLiderados: { select: { id: true, name: true } },
        assignments: { select: { courseId: true } },
      },
    }),
    prisma.grupo.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    // Cursos asignables individualmente (publicados; la Inducción la ven todos).
    prisma.course.findMany({
      where: { status: "PUBLISHED", category: { not: "INDUCCION" } },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div>
      <Header title="Usuarios" subtitle={`${usuarios.length} usuarios registrados`}>
        <NuevoUsuarioDialog grupos={grupos} cursos={cursos} />
      </Header>

      <UsuariosTabla
        grupos={grupos}
        cursos={cursos}
        usuarios={usuarios.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          company: u.company,
          active: u.active,
          grupoIds: u.grupos.map((g) => g.id),
          grupoNames: u.grupos.map((g) => g.name),
          liderGrupoIds: u.gruposLiderados.map((g) => g.id),
          liderGrupoNames: u.gruposLiderados.map((g) => g.name),
          cursoIds: u.assignments.map((a) => a.courseId),
        }))}
      />
    </div>
  );
}
