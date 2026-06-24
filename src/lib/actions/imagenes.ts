"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const MAX_BYTES = 1024 * 1024; // 1 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Sube una imagen (solo admin) y devuelve la URL interna para usarla en bloques.
export async function uploadImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const s = await auth();
  const role = s?.user?.role;
  // SUPER_ADMIN y AREA_LEADER pueden subir imágenes (editor de lecciones).
  if (role !== "SUPER_ADMIN" && role !== "AREA_LEADER") {
    return { error: "No autorizado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No se recibió el archivo." };
  if (!ALLOWED.includes(file.type)) {
    return { error: "Formato no soportado. Usa JPG, PNG, WebP o GIF." };
  }
  if (file.size > MAX_BYTES) {
    return {
      error: "La imagen pesa más de 1 MB. Comprímela antes de subirla.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const img = await prisma.imageAsset.create({
    data: {
      name: file.name,
      mime: file.type,
      size: file.size,
      data: bytes,
    },
  });

  return { url: `/api/imagenes/${img.id}` };
}
