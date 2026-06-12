"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, ListTree } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { deleteCourse, setCourseStatus } from "@/lib/actions/cursos";
import { CursoFormDialog, type CursoFormData } from "@/components/admin/CursoFormDialog";
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
        <Button onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo curso
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
          {query ? `Sin resultados para “${q}”.` : "Aún no hay cursos. Crea el primero."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{c.title}</p>
                  <span className="flex items-center gap-1.5">
                    <Switch
                      checked={c.status === "PUBLISHED"}
                      disabled={pending}
                      onCheckedChange={() => toggleStatus(c)}
                      title={
                        c.status === "PUBLISHED"
                          ? "Desactivar (los empleados dejan de verlo)"
                          : "Activar (visible para los empleados)"
                      }
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        c.status === "PUBLISHED"
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {c.status === "PUBLISHED" ? "Activo" : "Inactivo"}
                    </span>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wide text-gold">
                    {CATEGORY_LABEL[c.category]} · {COMPANY_LABEL[c.company]}
                  </span>{" "}
                  · {c.moduleCount} módulos · {c.lessonCount} lecciones
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/cursos/${c.id}/edit`}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary/80"
                >
                  <ListTree className="h-4 w-4" />
                  Contenido
                </Link>
                <button
                  type="button"
                  title="Editar datos"
                  onClick={() => setEditing(c)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Eliminar"
                  onClick={() => setDeleting(c)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
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
