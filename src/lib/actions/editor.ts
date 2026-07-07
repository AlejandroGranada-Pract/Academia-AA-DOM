"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  assertCourse,
  assertModule,
  assertLesson,
  assertExam,
  assertQuestion,
} from "@/lib/staff";

function refresh(courseId: string) {
  revalidatePath(`/admin/cursos/${courseId}/edit`);
  revalidatePath(`/cursos/${courseId}`);
  revalidatePath("/cursos");
}

// ============================== MÓDULOS ==============================

export async function addModule(courseId: string, title: string) {
  await assertCourse(courseId);
  const nombre = title.trim();
  if (!nombre) return;
  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await prisma.module.create({
    data: { courseId, title: nombre, order: (last?.order ?? 0) + 1 },
  });
  refresh(courseId);
}

export async function renameModule(
  courseId: string,
  moduleId: string,
  title: string,
) {
  await assertModule(moduleId);
  const nombre = title.trim();
  if (!nombre) return;
  await prisma.module.update({ where: { id: moduleId }, data: { title: nombre } });
  refresh(courseId);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await assertModule(moduleId);
  await prisma.module.delete({ where: { id: moduleId } }); // cascada: lecciones y exámenes
  refresh(courseId);
}

export async function moveModule(
  courseId: string,
  moduleId: string,
  dir: "up" | "down",
) {
  await assertModule(moduleId);
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  const idx = modules.findIndex((m) => m.id === moduleId);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swap < 0 || swap >= modules.length) return;
  await prisma.$transaction([
    prisma.module.update({
      where: { id: modules[idx].id },
      data: { order: modules[swap].order },
    }),
    prisma.module.update({
      where: { id: modules[swap].id },
      data: { order: modules[idx].order },
    }),
  ]);
  refresh(courseId);
}

// ============================== LECCIONES ==============================

export type LessonBlock = {
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "callout"
    | "image"
    | "video"
    | "pdf"
    | "table"
    | "prompt";
  text?: string;
  items?: string[];
  url?: string;
  caption?: string;
  title?: string;
  label?: string; // prompt: título opcional de la caja
  style?: "info" | "warning" | "tip";
  source?: string;
  headers?: string[]; // tabla: encabezados de columna
  rows?: string[][]; // tabla: filas (cada fila = arreglo de celdas)
};

// Siguiente orden disponible en el módulo (lecciones y exámenes comparten orden).
async function nextOrder(moduleId: string): Promise<number> {
  const [lastLesson, lastExam] = await Promise.all([
    prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    }),
    prisma.exam.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    }),
  ]);
  return Math.max(lastLesson?.order ?? 0, lastExam?.order ?? 0) + 1;
}

export async function addLesson(
  courseId: string,
  moduleId: string,
  title: string,
): Promise<string | null> {
  await assertModule(moduleId);
  const nombre = title.trim();
  if (!nombre) return null;
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: nombre,
      type: "MIXED",
      order: await nextOrder(moduleId),
      content: { blocks: [] },
    },
  });
  refresh(courseId);
  return lesson.id;
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  data: { title: string; durationMin: number | null; blocks: LessonBlock[] },
): Promise<string | undefined> {
  await assertLesson(lessonId);
  const title = data.title.trim();
  if (!title) return "El título es obligatorio.";
  // Limpieza: quita ítems vacíos de las listas y bloques de texto vacíos.
  const blocks = data.blocks
    .map((b) =>
      b.type === "list"
        ? { ...b, items: (b.items ?? []).map((s) => s.trim()).filter(Boolean) }
        : b,
    )
    .filter((b) => {
      if (b.type === "list") return (b.items ?? []).length > 0;
      if (b.type === "table") return (b.rows ?? []).length > 0;
      if (
        b.type === "heading" ||
        b.type === "paragraph" ||
        b.type === "callout" ||
        b.type === "prompt"
      )
        return (b.text ?? "").trim().length > 0;
      return (b.url ?? "").trim().length > 0;
    });
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      durationMin: data.durationMin,
      content: { blocks } as object,
    },
  });
  refresh(courseId);
  return undefined;
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await assertLesson(lessonId);
  await prisma.lesson.delete({ where: { id: lessonId } });
  refresh(courseId);
}

// Mueve un ítem (lección o examen) en la secuencia mezclada del módulo.
// En los bordes, cruza de módulo: ↓ en el último ítem lo pasa al inicio del
// módulo siguiente; ↑ en el primero lo pasa al final del módulo anterior.
export async function moveItem(
  courseId: string,
  moduleId: string,
  kind: "lesson" | "exam",
  itemId: string,
  dir: "up" | "down",
) {
  await assertModule(moduleId);
  const [lessons, exams] = await Promise.all([
    prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true, order: true },
    }),
    prisma.exam.findMany({
      where: { moduleId },
      select: { id: true, order: true },
    }),
  ]);
  const items = [
    ...lessons.map((l) => ({ kind: "lesson" as const, id: l.id, order: l.order })),
    ...exams.map((e) => ({ kind: "exam" as const, id: e.id, order: e.order })),
  ].sort((a, b) => a.order - b.order);

  // Normaliza órdenes a 1..n (evita duplicados heredados).
  items.forEach((it, i) => (it.order = i + 1));
  const idx = items.findIndex((it) => it.kind === kind && it.id === itemId);
  if (idx === -1) return;
  const swap = dir === "up" ? idx - 1 : idx + 1;

  if (swap >= 0 && swap < items.length) {
    // Movimiento dentro del módulo: intercambia posiciones.
    [items[idx].order, items[swap].order] = [items[swap].order, items[idx].order];
    await prisma.$transaction(
      items.map((it) =>
        it.kind === "lesson"
          ? prisma.lesson.update({ where: { id: it.id }, data: { order: it.order } })
          : prisma.exam.update({ where: { id: it.id }, data: { order: it.order } }),
      ),
    );
  } else {
    // Borde del módulo: mover al módulo vecino.
    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: { id: true },
    });
    const mIdx = modules.findIndex((m) => m.id === moduleId);
    const targetIdx = dir === "up" ? mIdx - 1 : mIdx + 1;
    if (mIdx === -1 || targetIdx < 0 || targetIdx >= modules.length) return;
    const targetId = modules[targetIdx].id;

    let newOrder: number;
    if (dir === "up") {
      // Al final del módulo anterior.
      newOrder = await nextOrder(targetId);
    } else {
      // Al inicio del módulo siguiente (antes del mínimo actual).
      const [minLesson, minExam] = await Promise.all([
        prisma.lesson.findFirst({
          where: { moduleId: targetId },
          orderBy: { order: "asc" },
          select: { order: true },
        }),
        prisma.exam.findFirst({
          where: { moduleId: targetId },
          orderBy: { order: "asc" },
          select: { order: true },
        }),
      ]);
      newOrder =
        Math.min(minLesson?.order ?? 1, minExam?.order ?? 1) - 1;
    }

    if (kind === "lesson") {
      await prisma.lesson.update({
        where: { id: itemId },
        data: { moduleId: targetId, order: newOrder },
      });
    } else {
      await prisma.exam.update({
        where: { id: itemId },
        data: { moduleId: targetId, order: newOrder },
      });
    }
  }
  refresh(courseId);
}

// ============================== EXÁMENES ==============================

// Crea (examId = null) o actualiza un examen. Los nuevos van al final del módulo.
export async function saveExam(
  courseId: string,
  moduleId: string,
  examId: string | null,
  data: {
    title: string;
    description: string;
    passingScore: number;
    maxAttempts: number;
    timeLimitMin: number | null;
  },
): Promise<string | undefined> {
  // Editar un examen existente valida ese examen; crear uno valida el módulo.
  if (examId) await assertExam(examId);
  else await assertModule(moduleId);
  const title = data.title.trim();
  if (!title) return "El título es obligatorio.";
  const payload = {
    title,
    description: data.description.trim() || null,
    passingScore: Math.min(100, Math.max(0, data.passingScore)),
    maxAttempts: Math.max(1, data.maxAttempts),
    timeLimitMin: data.timeLimitMin,
  };
  if (examId) {
    await prisma.exam.update({ where: { id: examId }, data: payload });
  } else {
    await prisma.exam.create({
      data: { ...payload, moduleId, order: await nextOrder(moduleId) },
    });
  }
  refresh(courseId);
  return undefined;
}

export async function deleteExam(courseId: string, examId: string) {
  await assertExam(examId);
  await prisma.exam.delete({ where: { id: examId } });
  refresh(courseId);
}

// ============================== PREGUNTAS ==============================

export type QuestionInput = {
  question: string;
  type: "MULTIPLE_CHOICE" | "MULTI_SELECT" | "TRUE_FALSE";
  options: string[];
  correctAnswer: number | number[];
  points: number;
  explanation: string;
};

function validateQuestion(q: QuestionInput): string | undefined {
  if (!q.question.trim()) return "El enunciado es obligatorio.";
  if (q.options.length < 2) return "Debe haber al menos 2 opciones.";
  if (q.options.some((o) => !o.trim())) return "Hay opciones vacías.";
  if (Array.isArray(q.correctAnswer)) {
    if (q.correctAnswer.length === 0)
      return "Marca al menos una respuesta correcta.";
  } else if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
    return "Marca la respuesta correcta.";
  }
  return undefined;
}

export async function addQuestion(
  courseId: string,
  examId: string,
  q: QuestionInput,
): Promise<string | undefined> {
  await assertExam(examId);
  const err = validateQuestion(q);
  if (err) return err;
  const last = await prisma.examQuestion.findFirst({
    where: { examId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await prisma.examQuestion.create({
    data: {
      examId,
      question: q.question.trim(),
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: Math.max(1, q.points),
      explanation: q.explanation.trim() || null,
      order: (last?.order ?? 0) + 1,
    },
  });
  refresh(courseId);
  return undefined;
}

export async function updateQuestion(
  courseId: string,
  questionId: string,
  q: QuestionInput,
): Promise<string | undefined> {
  await assertQuestion(questionId);
  const err = validateQuestion(q);
  if (err) return err;
  await prisma.examQuestion.update({
    where: { id: questionId },
    data: {
      question: q.question.trim(),
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: Math.max(1, q.points),
      explanation: q.explanation.trim() || null,
    },
  });
  refresh(courseId);
  return undefined;
}

export async function deleteQuestion(courseId: string, questionId: string) {
  await assertQuestion(questionId);
  await prisma.examQuestion.delete({ where: { id: questionId } });
  refresh(courseId);
}
