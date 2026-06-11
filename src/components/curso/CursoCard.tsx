import Link from "next/link";
import {
  GraduationCap,
  Wrench,
  Palette,
  Users,
  RefreshCw,
  ClipboardList,
  BookOpen,
  Clock,
  type LucideIcon,
} from "lucide-react";

type Category =
  | "INDUCCION"
  | "CAPACITACION_AREA"
  | "FORMACION_CONTINUA"
  | "TECNICO"
  | "PRODUCTO"
  | "PROCESO";

type Company = "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS";

export type CursoCardData = {
  id: string;
  title: string;
  description: string;
  category: Category;
  company: Company;
  estimatedHours: number | null;
  lessonCount: number;
  progressPct: number;
};

const CATEGORY: Record<Category, { label: string; icon: LucideIcon }> = {
  INDUCCION: { label: "Inducción", icon: GraduationCap },
  CAPACITACION_AREA: { label: "Capacitación de área", icon: Users },
  FORMACION_CONTINUA: { label: "Formación continua", icon: RefreshCw },
  TECNICO: { label: "Técnico", icon: Wrench },
  PRODUCTO: { label: "Producto", icon: Palette },
  PROCESO: { label: "Proceso", icon: ClipboardList },
};

// El degradado del encabezado depende de la empresa (azul AA / dorado DOM / ambas).
const COMPANY: Record<Company, { label: string; gradient: string }> = {
  AMBIENTE_AZUL: {
    label: "Ambiente Azul",
    gradient: "from-primary to-primary-dark",
  },
  DOM_DESIGN: {
    label: "DOM Design",
    gradient: "from-gold to-gold-light",
  },
  AMBAS: {
    label: "AA | DOM",
    gradient: "from-primary via-[#8aa0b8] to-gold",
  },
};

export function CursoCard({ course }: { course: CursoCardData }) {
  const cat = CATEGORY[course.category];
  const comp = COMPANY[course.company];
  const Icon = cat.icon;

  return (
    <Link
      href={`/cursos/${course.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-12px_rgba(31,31,31,0.25)]"
    >
      {/* Encabezado con degradado de marca */}
      <div
        className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${comp.gradient}`}
      >
        <Icon className="h-12 w-12 text-white/90" />
        <span className="absolute left-3 top-3 rounded-md bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {cat.label}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
          {comp.label}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-foreground">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {course.lessonCount} {course.lessonCount === 1 ? "lección" : "lecciones"}
          </span>
          {course.estimatedHours != null && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {course.estimatedHours} h
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                course.progressPct === 100 ? "bg-success" : "bg-primary"
              }`}
              style={{ width: `${course.progressPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {course.progressPct === 0
              ? "No iniciado"
              : course.progressPct === 100
                ? "Completado ✓"
                : `${course.progressPct}% completado`}
          </p>
        </div>
      </div>
    </Link>
  );
}
