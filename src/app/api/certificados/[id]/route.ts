import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CertificadoDoc } from "@/components/certificado/CertificadoPDF";

// react-pdf necesita runtime de Node (no edge).
export const runtime = "nodejs";

const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "Ambiente Azul | DOM Design",
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
function fmtFecha(d: Date) {
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("No autorizado", { status: 401 });

  const cert = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      course: { select: { title: true, company: true } },
    },
  });
  if (!cert) return new Response("Certificado no encontrado", { status: 404 });

  // Solo el dueño del certificado o un admin pueden descargarlo.
  const esAdmin = session.user.role === "SUPER_ADMIN";
  if (cert.userId !== userId && !esAdmin) {
    return new Response("No autorizado", { status: 403 });
  }

  // QR que apunta a la verificación pública. Base: NEXTAUTH_URL o el host real.
  const base = (
    process.env.NEXTAUTH_URL || new URL(_req.url).origin
  ).replace(/\/$/, "");
  const verifyUrl = `${base}/verificar/${cert.code}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 240,
    color: { dark: "#1F1F1F", light: "#F8F7F4" },
  });

  const buffer = await renderToBuffer(
    CertificadoDoc({
      nombre: cert.user.name ?? "—",
      curso: cert.course.title,
      empresa: COMPANY_LABEL[cert.course.company] ?? cert.course.company,
      fecha: fmtFecha(cert.issuedAt),
      codigo: cert.code,
      qrDataUrl,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Certificado-${cert.code}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
