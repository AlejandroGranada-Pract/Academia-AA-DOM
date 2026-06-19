"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type ActionResult = { ok: true } | { ok: false; error: string };

const MAX_LEN = 2000;

// Publica una pregunta (parentId null) o una respuesta (parentId definido).
export async function postComment(input: {
  lessonId: string;
  courseId: string;
  body: string;
  parentId?: string | null;
}): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "No autenticado." };

  const body = input.body.trim();
  if (!body) return { ok: false, error: "Escribe un mensaje." };
  if (body.length > MAX_LEN) {
    return { ok: false, error: `Máximo ${MAX_LEN} caracteres.` };
  }

  // Una respuesta solo puede colgar de una pregunta raíz de la MISMA lección
  // (mantenemos un único nivel de anidación).
  if (input.parentId) {
    const parent = await prisma.lessonComment.findUnique({
      where: { id: input.parentId },
      select: { lessonId: true, parentId: true },
    });
    if (!parent || parent.lessonId !== input.lessonId || parent.parentId) {
      return { ok: false, error: "Comentario inválido." };
    }
  }

  await prisma.lessonComment.create({
    data: {
      lessonId: input.lessonId,
      userId,
      body,
      parentId: input.parentId ?? null,
    },
  });

  revalidatePath(`/cursos/${input.courseId}/leccion/${input.lessonId}`);
  return { ok: true };
}

// Borra un comentario (y sus respuestas, por cascada). Solo el autor o un
// SUPER_ADMIN pueden hacerlo.
export async function deleteComment(input: {
  id: string;
  courseId: string;
  lessonId: string;
}): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId) return { ok: false, error: "No autenticado." };

  const comment = await prisma.lessonComment.findUnique({
    where: { id: input.id },
    select: { userId: true },
  });
  if (!comment) return { ok: true }; // ya no existe

  if (comment.userId !== userId && role !== "SUPER_ADMIN") {
    return { ok: false, error: "No tienes permiso para borrar esto." };
  }

  await prisma.lessonComment.delete({ where: { id: input.id } });
  revalidatePath(`/cursos/${input.courseId}/leccion/${input.lessonId}`);
  return { ok: true };
}
