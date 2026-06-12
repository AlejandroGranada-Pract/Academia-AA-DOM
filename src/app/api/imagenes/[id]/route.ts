import { prisma } from "@/lib/db";

// Sirve una imagen guardada en la base. Protegida por el middleware de auth
// (solo usuarios logueados la ven), con caché fuerte del navegador.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const img = await prisma.imageAsset.findUnique({ where: { id: params.id } });
  if (!img) return new Response("No encontrada", { status: 404 });

  return new Response(img.data as unknown as BodyInit, {
    headers: {
      "Content-Type": img.mime,
      "Content-Length": String(img.size),
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
