"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

type Category =
  | "INDUCCION"
  | "CAPACITACION_AREA"
  | "FORMACION_CONTINUA"
  | "TECNICO"
  | "PRODUCTO"
  | "PROCESO";
type Company = "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS";
type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

async function requireAdmin(): Promise<string> {
  const s = await auth();
  const role = s?.user?.role;
  // SUPER_ADMIN y AREA_LEADER pueden gestionar cursos.
  if (role !== "SUPER_ADMIN" && role !== "AREA_LEADER") {
    throw new Error("No autorizado");
  }
  return s!.user.id;
}

function refresh(courseId?: string) {
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  if (courseId) {
    revalidatePath(`/admin/cursos/${courseId}/edit`);
    revalidatePath(`/cursos/${courseId}`);
  }
}

function parseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "INDUCCION") as Category;
  const company = String(formData.get("company") ?? "AMBIENTE_AZUL") as Company;
  const hoursRaw = String(formData.get("estimatedHours") ?? "").trim();
  const passingRaw = String(formData.get("passingScore") ?? "70").trim();
  const dueMode = String(formData.get("dueMode") ?? "none"); // none | days | date
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDaysRaw = String(formData.get("dueDays") ?? "").trim();
  const grupoIds = formData
    .getAll("grupoIds")
    .map((v) => String(v))
    .filter(Boolean);

  return {
    title,
    description,
    category,
    company,
    estimatedHours: hoursRaw ? Number(hoursRaw) : null,
    passingScore: passingRaw ? Math.min(100, Math.max(0, parseInt(passingRaw, 10))) : 70,
    // Solo uno aplica según el modo elegido.
    dueDate: dueMode === "date" && dueRaw ? new Date(dueRaw) : null,
    dueDays:
      dueMode === "days" && dueDaysRaw
        ? Math.max(1, parseInt(dueDaysRaw, 10))
        : null,
    grupoIds,
  };
}

export async function createCourse(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  const userId = await requireAdmin();
  const f = parseForm(formData);
  if (!f.title || !f.description) {
    return { error: "Título y descripción son obligatorios." };
  }
  const curso = await prisma.course.create({
    data: {
      title: f.title,
      description: f.description,
      category: f.category,
      company: f.company,
      status: "DRAFT", // siempre nace como borrador
      estimatedHours: f.estimatedHours,
      passingScore: f.passingScore,
      dueDate: f.dueDate,
      dueDays: f.dueDays,
      createdBy: userId,
      grupos: f.grupoIds.length
        ? { connect: f.grupoIds.map((id) => ({ id })) }
        : undefined,
    },
  });
  refresh(curso.id);
  return { id: curso.id };
}

export async function updateCourse(
  courseId: string,
  formData: FormData,
): Promise<string | undefined> {
  await requireAdmin();
  const f = parseForm(formData);
  if (!f.title || !f.description) {
    return "Título y descripción son obligatorios.";
  }
  const data: Prisma.CourseUpdateInput = {
    title: f.title,
    description: f.description,
    category: f.category,
    company: f.company,
    estimatedHours: f.estimatedHours,
    passingScore: f.passingScore,
    dueDate: f.dueDate,
    dueDays: f.dueDays,
    grupos: { set: f.grupoIds.map((id) => ({ id })) },
  };
  await prisma.course.update({ where: { id: courseId }, data });
  refresh(courseId);
  return undefined;
}

export async function setCourseStatus(courseId: string, status: Status) {
  await requireAdmin();
  await prisma.course.update({ where: { id: courseId }, data: { status } });
  refresh(courseId);
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id: courseId } });
  refresh();
}
