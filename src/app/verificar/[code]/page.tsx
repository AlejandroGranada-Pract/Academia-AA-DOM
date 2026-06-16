import Link from "next/link";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import { prisma } from "@/lib/db";

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

export default async function VerificarPage({
  params,
}: {
  params: { code: string };
}) {
  const code = decodeURIComponent(params.code).trim().toUpperCase();
  const cert = await prisma.certificate.findUnique({
    where: { code },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true, company: true } },
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-grafito via-[#2a2a2a] to-grafito p-5">
      <div className="w-full max-w-lg">
        {/* Marca */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <span className="font-heading text-xl tracking-wider text-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-7 w-px bg-white/30" />
          <span className="font-heading text-xl tracking-[0.25em] text-gold">
            DOM
          </span>
        </div>

        <div className="rounded-2xl border border-white/15 bg-grafito/40 p-8 text-center shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
          {cert ? (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
              <h1 className="mt-4 text-2xl text-white">Certificado válido</h1>
              <p className="mt-1 text-sm text-white/55">
                Este certificado fue emitido por la Academia AA | DOM.
              </p>

              <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-5 text-left">
                <Campo etiqueta="Otorgado a" valor={cert.user.name ?? "—"} />
                <Campo etiqueta="Curso" valor={cert.course.title} />
                <Campo
                  etiqueta="Empresa"
                  valor={COMPANY_LABEL[cert.course.company] ?? cert.course.company}
                />
                <Campo
                  etiqueta="Fecha de emisión"
                  valor={fmtFecha(cert.issuedAt)}
                />
                <Campo etiqueta="Código" valor={cert.code} mono />
              </div>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-14 w-14 text-destructive" />
              <h1 className="mt-4 text-2xl text-white">
                Certificado no encontrado
              </h1>
              <p className="mt-2 text-sm text-white/55">
                No existe ningún certificado con el código{" "}
                <span className="font-mono text-white/80">{code}</span>. Verifica
                que esté escrito correctamente.
              </p>
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/40">
            <Award className="h-3.5 w-3.5 text-gold" />
            Verificación oficial · Academia AA | DOM
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          <Link href="/verificar" className="hover:text-white/60">
            Verificar otro código
          </Link>
        </p>
      </div>
    </main>
  );
}

function Campo({
  etiqueta,
  valor,
  mono,
}: {
  etiqueta: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="text-xs uppercase tracking-wide text-white/40">
        {etiqueta}
      </span>
      <span
        className={`text-sm font-medium text-white ${mono ? "font-mono" : ""}`}
      >
        {valor}
      </span>
    </div>
  );
}
