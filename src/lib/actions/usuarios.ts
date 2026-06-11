"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
  const area = String(formData.get("area") ?? "").trim();

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
      area: area || null,
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
