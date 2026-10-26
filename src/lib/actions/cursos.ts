"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff, assertCourse } from "@/lib/staff";
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
    // Vencimientos desactivados en toda la plataforma: nunca se fija fecha límite.
    dueDate: null,
    dueDays: null,
    grupoIds,
  };
}

export async function createCourse(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  const staff = await requireStaff();
  const f = parseForm(formData);
  if (!f.title || !f.description) {
    return { error: "Título y descripción son obligatorios." };
  }
  // El líder solo asigna el curso a sus grupos liderados (y debe quedar en ≥1,
  // si no, el curso no sería "suyo" y no podría volver a verlo).
  let grupoIds = f.grupoIds;
  if (staff.role === "AREA_LEADER") {
    grupoIds = grupoIds.filter((id) => staff.ledGroupIds.includes(id));
    if (grupoIds.length === 0) grupoIds = staff.ledGroupIds;
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
      createdBy: staff.id,
      grupos: grupoIds.length
        ? { connect: grupoIds.map((id) => ({ id })) }
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
  const staff = await assertCourse(courseId);
  const f = parseForm(formData);
  if (!f.title || !f.description) {
    return "Título y descripción son obligatorios.";
  }
  // Asignación a grupos: el admin reemplaza el set completo. El líder solo
  // toca sus grupos liderados y preserva los demás (asignados por el admin).
  let grupoIds = f.grupoIds;
  if (staff.role === "AREA_LEADER") {
    const actual = await prisma.course.findUnique({
      where: { id: courseId },
      select: { grupos: { select: { id: true } } },
    });
    const ajenos = (actual?.grupos ?? [])
      .map((g) => g.id)
      .filter((id) => !staff.ledGroupIds.includes(id));
    const propios = f.grupoIds.filter((id) => staff.ledGroupIds.includes(id));
    grupoIds = Array.from(new Set([...ajenos, ...propios]));
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
    grupos: { set: grupoIds.map((id) => ({ id })) },
  };
  await prisma.course.update({ where: { id: courseId }, data });
  refresh(courseId);
  return undefined;
}

export async function setCourseStatus(courseId: string, status: Status) {
  await assertCourse(courseId);
  await prisma.course.update({ where: { id: courseId }, data: { status } });
  refresh(courseId);
}

export async function deleteCourse(courseId: string) {
  await assertCourse(courseId);
  await prisma.course.delete({ where: { id: courseId } });
  refresh();
}
