"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { issueCertificateIfComplete } from "@/lib/certificados";
import { otorgarLogros, titulosLogros } from "@/lib/badges";
import { courseIdOfLesson, getLearnerCourseAccess } from "@/lib/courses";

const MAX_URL = 2048;

// Marca/desmarca una lección como completada para el usuario actual.
// Devuelve los títulos de las insignias recién desbloqueadas (para el toast).
// El curso se resuelve desde la lección (no se confía en el courseId del
// cliente) y se exige que el usuario pueda verlo y tenga la lección desbloqueada.
export async function setLessonProgress(
  lessonId: string,
  _courseId: string,
  completed: boolean,
): Promise<string[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const courseId = await courseIdOfLesson(lessonId);
  if (!courseId) return [];
  const acceso = await getLearnerCourseAccess(userId, courseId);
  if (!acceso || !acceso.unlockedIds.has(lessonId)) return [];

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

// Registra el máximo % visto de un video de una lección (monótono: nunca baja).
// Lo llama el reproductor de YouTube mientras avanza. Silencioso.
export async function registrarAvanceVideo(
  lessonId: string,
  url: string,
  pct: number,
): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !lessonId || !url || url.length > MAX_URL) return;
  const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));

  // Solo videos que existen en la lección, de cursos que el usuario puede ver.
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { content: true, module: { select: { courseId: true } } },
  });
  if (!lesson?.module) return;
  if (!JSON.stringify(lesson.content ?? null).includes(JSON.stringify(url).slice(1, -1))) {
    return;
  }
  if (!(await getLearnerCourseAccess(userId, lesson.module.courseId))) return;

  await prisma.videoView.upsert({
    where: { userId_lessonId_url: { userId, lessonId, url } },
    create: { userId, lessonId, url, pct: p },
    update: {}, // no pisar hacia abajo aquí
  });
  // Solo sube si el nuevo % es mayor al guardado.
  await prisma.videoView.updateMany({
    where: { userId, lessonId, url, pct: { lt: p } },
    data: { pct: p },
  });
}
