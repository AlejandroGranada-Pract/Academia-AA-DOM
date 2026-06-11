"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

type Role = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";
type Company = "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("No autorizado");
  }
}

export async function createUser(
  formData: FormData,
): Promise<string | undefined> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "EMPLOYEE");
  const company = String(formData.get("company") ?? "AMBIENTE_AZUL");
  const grupoIds = formData
    .getAll("grupoIds")
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
      role: role as "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL",
      company: company as "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS",
      grupos: grupoIds.length
        ? { connect: grupoIds.map((id) => ({ id })) }
        : undefined,
    },
  });

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
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "EMPLOYEE") as Role;
  const company = String(formData.get("company") ?? "AMBIENTE_AZUL") as Company;
  const password = String(formData.get("password") ?? "");
  const grupoIds = formData
    .getAll("grupoIds")
    .map((v) => String(v))
    .filter(Boolean);

  if (!name) return "El nombre es obligatorio.";

  const data: Prisma.UserUpdateInput = {
    name,
    role,
    company,
    grupos: { set: grupoIds.map((id) => ({ id })) },
  };

  if (password) {
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id: userId }, data });
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
