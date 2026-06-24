"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { assertGrupo } from "@/lib/staff";

// Crear/renombrar/eliminar grupos: solo SUPER_ADMIN.
async function requireAdmin() {
  const s = await auth();
  if (s?.user?.role !== "SUPER_ADMIN") throw new Error("No autorizado");
}

export async function createGrupo(
  formData: FormData,
): Promise<string | undefined> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "El nombre es obligatorio.";
  const exists = await prisma.grupo.findUnique({ where: { name } });
  if (exists) return "Ya existe un grupo con ese nombre.";
  await prisma.grupo.create({ data: { name } });
  revalidatePath("/grupos");
  return undefined;
}

export async function renameGrupo(
  grupoId: string,
  name: string,
): Promise<string | undefined> {
  await requireAdmin();
  const nombre = name.trim();
  if (!nombre) return "El nombre es obligatorio.";
  const exists = await prisma.grupo.findFirst({
    where: { name: nombre, id: { not: grupoId } },
  });
  if (exists) return "Ya existe un grupo con ese nombre.";
  await prisma.grupo.update({ where: { id: grupoId }, data: { name: nombre } });
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${grupoId}`);
  return undefined;
}

export async function deleteGrupo(grupoId: string) {
  await requireAdmin();
  await prisma.grupo.delete({ where: { id: grupoId } });
  revalidatePath("/grupos");
}

export async function toggleCourseInGrupo(
  grupoId: string,
  courseId: string,
  member: boolean,
) {
  await assertGrupo(grupoId);
  await prisma.grupo.update({
    where: { id: grupoId },
    data: {
      courses: member
        ? { connect: { id: courseId } }
        : { disconnect: { id: courseId } },
    },
  });
  revalidatePath(`/grupos/${grupoId}`);
  revalidatePath("/cursos");
}

export async function toggleUserInGrupo(
  grupoId: string,
  userId: string,
  member: boolean,
) {
  await assertGrupo(grupoId);
  await prisma.grupo.update({
    where: { id: grupoId },
    data: {
      users: member
        ? { connect: { id: userId } }
        : { disconnect: { id: userId } },
    },
  });
  revalidatePath(`/grupos/${grupoId}`);
  revalidatePath("/cursos");
}

// Guarda de una sola vez la membresía completa del grupo (cursos + usuarios).
// Reemplaza las listas con `set`. Usado por el editor con botón "Guardar".
export async function setGrupoMembership(
  grupoId: string,
  courseIds: string[],
  userIds: string[],
): Promise<string | undefined> {
  await assertGrupo(grupoId);
  await prisma.grupo.update({
    where: { id: grupoId },
    data: {
      courses: { set: courseIds.map((id) => ({ id })) },
      users: { set: userIds.map((id) => ({ id })) },
    },
  });
  revalidatePath(`/grupos/${grupoId}`);
  revalidatePath("/cursos");
  revalidatePath("/mi-equipo");
  return undefined;
}
