import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { MembershipPicker } from "@/components/admin/MembershipPicker";

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
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/");

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
        subtitle="Marca los cursos y usuarios que pertenecen a este grupo"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cursos */}
        <section className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.1)] backdrop-blur-sm">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Cursos del grupo
          </h2>
          <MembershipPicker
            grupoId={grupo.id}
            kind="course"
            placeholder="Buscar curso..."
            items={courses.map((c) => ({
              id: c.id,
              title: c.title,
              subtitle: COMPANY_LABEL[c.company] ?? c.company,
              member: courseIds.has(c.id),
            }))}
          />
        </section>

        {/* Usuarios */}
        <section className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.1)] backdrop-blur-sm">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Usuarios del grupo
          </h2>
          <MembershipPicker
            grupoId={grupo.id}
            kind="user"
            placeholder="Buscar usuario..."
            items={users.map((u) => ({
              id: u.id,
              title: u.name,
              subtitle: u.email,
              member: userIds.has(u.id),
            }))}
          />
        </section>
      </div>
    </div>
  );
}
