import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Sirve una imagen guardada en la base, solo a usuarios logueados (se verifica
// aquí además del middleware), con caché fuerte del navegador.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("No autorizado", { status: 401 });

  const img = await prisma.imageAsset.findUnique({ where: { id: params.id } });
  if (!img) return new Response("No encontrada", { status: 404 });

  return new Response(img.data as unknown as BodyInit, {
    headers: {
      "Content-Type": ALLOWED.includes(img.mime) ? img.mime : "application/octet-stream",
      "Content-Length": String(img.size),
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
