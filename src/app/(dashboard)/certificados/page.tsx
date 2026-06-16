import Link from "next/link";
import { Award, Download, BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  INDUCCION: "Inducción",
  CAPACITACION_AREA: "Capacitación de área",
  FORMACION_CONTINUA: "Formación continua",
  TECNICO: "Técnico",
  PRODUCTO: "Producto",
  PROCESO: "Proceso",
};
const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "AA | DOM",
};
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function fmtFecha(d: Date) {
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default async function CertificadosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const certificados = userId
    ? await prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: "desc" },
        include: {
          course: { select: { title: true, company: true, category: true } },
        },
      })
    : [];

  return (
    <div>
      <Header
        title="Mis Certificados"
        subtitle={
          certificados.length > 0
            ? `${certificados.length} ${certificados.length === 1 ? "certificado obtenido" : "certificados obtenidos"}`
            : "Aquí aparecen los cursos que has completado"
        }
      />

      {certificados.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center">
          <Award className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">
            Aún no tienes certificados
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa un curso al 100% (todas las lecciones y exámenes) y tu
            certificado se generará automáticamente.
          </p>
          <Link href="/cursos" className={cn(buttonVariants(), "mt-5 gap-1.5")}>
            <BookOpen className="h-4 w-4" />
            Ir a mis cursos
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificados.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm"
            >
              {/* Cinta superior con el sello dorado */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-grafito to-[#2a2a2a] px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                  <Award className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                    Certificado · {CATEGORY_LABEL[c.course.category]}
                  </p>
                  <p className="truncate font-semibold text-white">
                    {c.course.title}
                  </p>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {COMPANY_LABEL[c.course.company]}
                  </span>
                  <span className="text-muted-foreground">
                    Emitido el {fmtFecha(c.issuedAt)}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                <a
                  href={`/api/certificados/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants(), "w-full gap-1.5")}
                >
                  <Download className="h-4 w-4" />
                  Ver / descargar PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
