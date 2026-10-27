"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const MAX_BYTES = 1024 * 1024; // 1 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Tipo real según la firma del archivo (no se confía en el tipo que declara el
// navegador).
function detectarTipo(b: Uint8Array): string | null {
  const ascii = (i: number, n: number) => String.fromCharCode(...Array.from(b.subarray(i, i + n)));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && ascii(1, 3) === "PNG") return "image/png";
  if (b.length >= 6 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a")) return "image/gif";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  return null;
}

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
  const tipo = detectarTipo(bytes);
  if (!tipo || !ALLOWED.includes(tipo)) {
    return { error: "El archivo no es una imagen válida (JPG, PNG, WebP o GIF)." };
  }
  const img = await prisma.imageAsset.create({
    data: {
      name: file.name.slice(0, 200),
      mime: tipo,
      size: file.size,
      data: bytes,
    },
  });

  return { url: `/api/imagenes/${img.id}` };
}
