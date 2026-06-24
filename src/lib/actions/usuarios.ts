"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { mailEnabled } from "@/lib/mailer";
import { enviarBienvenida, enviarCursoAsignado } from "@/lib/emails";
import type { Prisma } from "@/generated/prisma/client";

type Role = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";
type Company = "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS";

async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("No autorizado");
  }
  return session.user.id;
}

export async function createUser(
  formData: FormData,
): Promise<string | undefined> {
  const adminId = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "EMPLOYEE") as Role;
  const company = String(formData.get("company") ?? "AMBIENTE_AZUL");
  const grupoIds = formData
    .getAll("grupoIds")
    .map((v) => String(v))
    .filter(Boolean);
  // Solo aplica si el rol es líder de área.
  const liderGrupoIds =
    role === "AREA_LEADER"
      ? formData.getAll("liderGrupoIds").map((v) => String(v)).filter(Boolean)
      : [];
  // Cursos asignados directamente (acceso extra sin pertenecer a un grupo).
  const cursoIds = formData
    .getAll("cursoIds")
    .map((v) => String(v))
    .filter(Boolean);

  if (!name || !email || !password) {
    return "Nombre, correo y contraseña son obligatorios.";
  }
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return "Ya existe un usuario con ese correo.";

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      company: company as "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS",
      grupos: grupoIds.length
        ? { connect: grupoIds.map((id) => ({ id })) }
        : undefined,
      gruposLiderados: liderGrupoIds.length
        ? { connect: liderGrupoIds.map((id) => ({ id })) }
        : undefined,
      assignments: cursoIds.length
        ? { create: cursoIds.map((courseId) => ({ courseId, assignedBy: adminId })) }
        : undefined,
    },
  });

  // Correo de bienvenida con sus datos de acceso (no bloquea si el correo falla).
  if (mailEnabled()) {
    await enviarBienvenida({ to: email, nombre: name.split(" ")[0] || name, email, password });
  }

  revalidatePath("/usuarios");
  return undefined; // sin error = éxito
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/usuarios");
}

export async function updateUser(
  userId: string,
  formData: FormData,
): Promise<string | undefined> {
  const adminId = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "EMPLOYEE") as Role;
  const company = String(formData.get("company") ?? "AMBIENTE_AZUL") as Company;
  const password = String(formData.get("password") ?? "");
  const grupoIds = formData
    .getAll("grupoIds")
    .map((v) => String(v))
    .filter(Boolean);
  // Si deja de ser líder, se limpian los grupos liderados.
  const liderGrupoIds =
    role === "AREA_LEADER"
      ? formData.getAll("liderGrupoIds").map((v) => String(v)).filter(Boolean)
      : [];
  // Cursos asignados directamente: se reemplaza el set completo.
  const cursoIds = formData
    .getAll("cursoIds")
    .map((v) => String(v))
    .filter(Boolean);

  if (!name) return "El nombre es obligatorio.";

  // Cursos individuales que se agregan en esta edición (para avisar por correo).
  const previas = mailEnabled()
    ? (
        await prisma.courseAssignment.findMany({
          where: { userId },
          select: { courseId: true },
        })
      ).map((a) => a.courseId)
    : [];
  const cursosNuevos = cursoIds.filter((id) => !previas.includes(id));

  const data: Prisma.UserUpdateInput = {
    name,
    role,
    company,
    grupos: { set: grupoIds.map((id) => ({ id })) },
    gruposLiderados: { set: liderGrupoIds.map((id) => ({ id })) },
    assignments: {
      deleteMany: {},
      create: cursoIds.map((courseId) => ({ courseId, assignedBy: adminId })),
    },
  };

  if (password) {
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id: userId }, data });

  // Avisa al usuario de los cursos recién asignados de forma individual.
  if (mailEnabled() && cursosNuevos.length) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    const cursos = await prisma.course.findMany({
      where: { id: { in: cursosNuevos } },
      select: { title: true },
    });
    if (u?.email) {
      for (const c of cursos) {
        await enviarCursoAsignado({ to: u.email, cursoTitle: c.title });
      }
    }
  }

  revalidatePath("/usuarios");
  return undefined;
}

export async function deleteUser(
  userId: string,
): Promise<string | undefined> {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("No autorizado");
  if (session.user.id === userId) {
    return "No puedes eliminar tu propia cuenta.";
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/usuarios");
  return undefined;
}
