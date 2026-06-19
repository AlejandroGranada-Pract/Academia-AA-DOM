"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfComplete } from "@/lib/certificados";
import { otorgarLogros, titulosLogros } from "@/lib/badges";

// Marca/desmarca una lección como completada para el usuario actual.
// Devuelve los títulos de las insignias recién desbloqueadas (para el toast).
export async function setLessonProgress(
  lessonId: string,
  courseId: string,
  completed: boolean,
): Promise<string[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      status: completed ? "COMPLETED" : "IN_PROGRESS",
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId,
      lessonId,
      status: completed ? "COMPLETED" : "IN_PROGRESS",
      startedAt: new Date(),
      completedAt: completed ? new Date() : null,
    },
  });

  // Si con esta lección se completó el curso, emite el certificado.
  let nuevasInsignias: string[] = [];
  if (completed) {
    await issueCertificateIfComplete(userId, courseId);
    nuevasInsignias = titulosLogros(await otorgarLogros(userId));
  }

  // Refresca las vistas que muestran progreso.
  revalidatePath("/");
  revalidatePath("/cursos");
  revalidatePath("/mi-progreso");
  revalidatePath("/certificados");
  revalidatePath(`/cursos/${courseId}`);
  revalidatePath(`/cursos/${courseId}/leccion/${lessonId}`);

  return nuevasInsignias;
}
