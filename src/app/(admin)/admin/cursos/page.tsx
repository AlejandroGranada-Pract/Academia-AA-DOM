import { prisma } from "@/lib/db";
import { getStaff } from "@/lib/staff";
import { Header } from "@/components/layout/Header";
import {
  CursosAdminLista,
  type CursoAdminRow,
} from "@/components/admin/CursosAdminLista";

function toDateInput(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export default async function GestionarCursosPage() {
  const staff = await getStaff();
  const isSuperAdmin = staff?.role === "SUPER_ADMIN";
  const ledGroupIds = staff?.ledGroupIds ?? [];
  // El admin ve todos los cursos; el líder solo los asignados a sus grupos.
  const cursoWhere = isSuperAdmin
    ? undefined
    : { grupos: { some: { id: { in: ledGroupIds } } } };
  const grupoWhere = isSuperAdmin ? undefined : { id: { in: ledGroupIds } };

  const [cursos, grupos] = await Promise.all([
    prisma.course.findMany({
      where: cursoWhere,
      orderBy: { createdAt: "asc" },
      include: {
        grupos: { select: { id: true } },
        modules: { select: { _count: { select: { lessons: true } } } },
      },
    }),
    prisma.grupo.findMany({
      where: grupoWhere,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: CursoAdminRow[] = cursos.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    company: c.company,
    status: c.status,
    estimatedHours: c.estimatedHours,
    passingScore: c.passingScore,
    dueDate: toDateInput(c.dueDate),
    dueDays: c.dueDays,
    grupoIds: c.grupos.map((g) => g.id),
    moduleCount: c.modules.length,
    lessonCount: c.modules.reduce((n, m) => n + m._count.lessons, 0),
  }));

  return (
    <div>
      <Header
        title="Gestionar Cursos"
        subtitle={`${rows.length} cursos (activos e inactivos)`}
      />
      <CursosAdminLista
        cursos={rows}
        grupos={grupos}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
