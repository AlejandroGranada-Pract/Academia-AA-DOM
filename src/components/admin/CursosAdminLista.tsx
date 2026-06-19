"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ListTree,
  Layers,
  BookOpen,
  GraduationCap,
  Wrench,
  Palette,
  Users,
  RefreshCw,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { deleteCourse, setCourseStatus } from "@/lib/actions/cursos";
import { CursoFormDialog, type CursoFormData } from "@/components/admin/CursoFormDialog";
import { AsistenteIA } from "@/components/admin/AsistenteIA";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
const CATEGORY_ICON: Record<string, LucideIcon> = {
  INDUCCION: GraduationCap,
  CAPACITACION_AREA: Users,
  FORMACION_CONTINUA: RefreshCw,
  TECNICO: Wrench,
  PRODUCTO: Palette,
  PROCESO: ClipboardList,
};
// Degradado del ícono según la empresa (azul AA / dorado DOM / ambas).
const COMPANY_GRADIENT: Record<string, string> = {
  AMBIENTE_AZUL: "from-primary to-primary-dark",
  DOM_DESIGN: "from-gold to-gold-light",
  AMBAS: "from-primary via-[#8aa0b8] to-gold",
};

export type CursoAdminRow = CursoFormData & {
  id: string;
  status: string;
  moduleCount: number;
  lessonCount: number;
};

export function CursosAdminLista({
  cursos,
  grupos,
}: {
  cursos: CursoAdminRow[];
  grupos: { id: string; name: string }[];
}) {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CursoAdminRow | null>(null);
  const [deleting, setDeleting] = useState<CursoAdminRow | null>(null);
  const [pending, startTransition] = useTransition();

  const query = q.trim().toLowerCase();
  const filtered = query
    ? cursos.filter((c) => c.title.toLowerCase().includes(query))
    : cursos;

  function toggleStatus(c: CursoAdminRow) {
    const next = c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      await setCourseStatus(c.id, next);
      toast.success(next === "PUBLISHED" ? "Curso activado" : "Curso desactivado");
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      await deleteCourse(deleting.id);
      toast.success("Curso eliminado");
      setDeleting(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar curso..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <AsistenteIA />
          <Button onClick={() => setCreating(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo curso
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
          {query ? `Sin resultados para “${q}”.` : "Aún no hay cursos. Crea el primero."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const Icon = CATEGORY_ICON[c.category] ?? GraduationCap;
            const activo = c.status === "PUBLISHED";
            return (
              <div
                key={c.id}
                className="group flex items-center gap-4 rounded-2xl border border-white/60 dark:border-border bg-white/75 dark:bg-card p-4 shadow-[0_8px_30px_-16px_rgba(31,31,31,0.2)] backdrop-blur-sm transition hover:border-white/80 dark:hover:border-border hover:shadow-[0_14px_40px_-18px_rgba(31,31,31,0.3)]"
              >
                {/* Ícono por empresa/categoría */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                    COMPANY_GRADIENT[c.company] ?? "from-primary to-gold"
                  } text-white shadow-sm ${activo ? "" : "opacity-50 grayscale"}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate font-semibold ${activo ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {c.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="rounded-md bg-gold/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-gold">
                      {CATEGORY_LABEL[c.category]}
                    </span>
                    <span className="text-muted-foreground">
                      {COMPANY_LABEL[c.company]}
                    </span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      {c.moduleCount} módulos
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      {c.lessonCount} lecciones
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div className="hidden shrink-0 items-center gap-2 md:flex">
                  <Switch
                    checked={activo}
                    disabled={pending}
                    onCheckedChange={() => toggleStatus(c)}
                    title={
                      activo
                        ? "Desactivar (los empleados dejan de verlo)"
                        : "Activar (visible para los empleados)"
                    }
                  />
                  <span
                    className={`w-14 text-xs font-semibold ${
                      activo ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <Link
                    href={`/admin/cursos/${c.id}/edit`}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary/80"
                  >
                    <ListTree className="h-4 w-4" />
                    <span className="hidden sm:inline">Contenido</span>
                  </Link>
                  <button
                    type="button"
                    title="Editar datos"
                    onClick={() => setEditing(c)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Eliminar"
                    onClick={() => setDeleting(c)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crear */}
      <CursoFormDialog open={creating} onOpenChange={setCreating} grupos={grupos} />

      {/* Editar datos */}
      <CursoFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        curso={editing}
        grupos={grupos}
      />

      {/* Eliminar */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar curso</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar <strong>{deleting?.title}</strong>?
              Se borran sus módulos, lecciones, exámenes y el progreso de los
              empleados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
