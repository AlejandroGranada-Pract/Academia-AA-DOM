"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  ClipboardCheck,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addModule,
  renameModule,
  deleteModule,
  moveModule,
  addLesson,
  deleteLesson,
  deleteExam,
  moveItem,
  type LessonBlock,
} from "@/lib/actions/editor";
import {
  LeccionEditorDialog,
  type LeccionEditable,
} from "@/components/admin/LeccionEditorDialog";
import {
  ExamenEditorDialog,
  type ExamenEditable,
} from "@/components/admin/ExamenEditor";
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

export type ItemEditable =
  | {
      kind: "lesson";
      id: string;
      title: string;
      durationMin: number | null;
      blocks: LessonBlock[];
    }
  | ({ kind: "exam" } & ExamenEditable);

export type ModuloEditable = {
  id: string;
  title: string;
  items: ItemEditable[];
};

export function CursoEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: ModuloEditable[];
}) {
  const [newModule, setNewModule] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);
  const [deletingMod, setDeletingMod] = useState<ModuloEditable | null>(null);
  const [newLesson, setNewLesson] = useState<{ moduleId: string; title: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<LeccionEditable | null>(null);
  const [examDialog, setExamDialog] = useState<{
    moduleId: string;
    examen: ExamenEditable | null;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    moduleId: string;
    item: ItemEditable;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function crearLeccion(moduleId: string, title: string) {
    if (!title.trim()) return;
    startTransition(async () => {
      const id = await addLesson(courseId, moduleId, title);
      setNewLesson(null);
      if (id) {
        // Abre el editor de contenido de una vez (menos clics).
        setEditingLesson({
          id,
          title: title.trim(),
          durationMin: null,
          blocks: [],
        });
      }
    });
  }

  function confirmarEliminarItem() {
    if (!deletingItem) return;
    const { item } = deletingItem;
    startTransition(async () => {
      if (item.kind === "lesson") {
        await deleteLesson(courseId, item.id);
        toast.success("Lección eliminada");
      } else {
        await deleteExam(courseId, item.id);
        toast.success("Examen eliminado");
      }
      setDeletingItem(null);
    });
  }

  return (
    <div className="space-y-4">
      {modules.map((m, mi) => (
        <div
          key={m.id}
          className="rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-4 backdrop-blur-sm"
        >
          {/* Encabezado del módulo */}
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {mi + 1}
            </span>
            {renaming?.id === m.id ? (
              <>
                <Input
                  value={renaming.title}
                  onChange={(e) => setRenaming({ id: m.id, title: e.target.value })}
                  className="h-8 flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  className="rounded p-1.5 text-success hover:bg-success/10"
                  onClick={() =>
                    startTransition(async () => {
                      await renameModule(courseId, m.id, renaming.title);
                      setRenaming(null);
                      toast.success("Módulo renombrado");
                    })
                  }
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                  onClick={() => setRenaming(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-semibold text-foreground">{m.title}</span>
                <button
                  type="button"
                  title="Renombrar"
                  onClick={() => setRenaming({ id: m.id, title: m.title })}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Subir módulo"
                  disabled={mi === 0 || pending}
                  onClick={() => startTransition(() => moveModule(courseId, m.id, "up"))}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Bajar módulo"
                  disabled={mi === modules.length - 1 || pending}
                  onClick={() => startTransition(() => moveModule(courseId, m.id, "down"))}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Eliminar módulo"
                  onClick={() => setDeletingMod(m)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Secuencia: lecciones y exámenes mezclados */}
          <div className="space-y-1.5">
            {m.items.map((it, ii) => (
              <div
                key={`${it.kind}-${it.id}`}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  it.kind === "exam"
                    ? "border-gold/40 bg-gold/5"
                    : "bg-card"
                }`}
              >
                {it.kind === "exam" ? (
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-gold" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm">
                  {it.title}
                  {it.kind === "exam" && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-gold">
                      Examen
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {it.kind === "lesson"
                    ? `${it.blocks.length} bloques${it.durationMin != null ? ` · ${it.durationMin} min` : ""}`
                    : `${it.questions.length} preguntas · ${it.passingScore}%`}
                </span>
                <button
                  type="button"
                  title="Editar"
                  onClick={() =>
                    it.kind === "lesson"
                      ? setEditingLesson({
                          id: it.id,
                          title: it.title,
                          durationMin: it.durationMin,
                          blocks: it.blocks,
                        })
                      : setExamDialog({ moduleId: m.id, examen: it })
                  }
                  className="rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title={
                    ii === 0 && mi > 0
                      ? "Mover al final del módulo anterior"
                      : "Subir"
                  }
                  disabled={(ii === 0 && mi === 0) || pending}
                  onClick={() =>
                    startTransition(() =>
                      moveItem(courseId, m.id, it.kind, it.id, "up"),
                    )
                  }
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title={
                    ii === m.items.length - 1 && mi < modules.length - 1
                      ? "Mover al inicio del módulo siguiente"
                      : "Bajar"
                  }
                  disabled={
                    (ii === m.items.length - 1 && mi === modules.length - 1) ||
                    pending
                  }
                  onClick={() =>
                    startTransition(() =>
                      moveItem(courseId, m.id, it.kind, it.id, "down"),
                    )
                  }
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Eliminar"
                  onClick={() => setDeletingItem({ moduleId: m.id, item: it })}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Agregar lección / examen */}
            {newLesson?.moduleId === m.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ moduleId: m.id, title: e.target.value })}
                  placeholder="Título de la lección"
                  className="h-9 flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") crearLeccion(m.id, newLesson.title);
                  }}
                />
                <Button
                  size="sm"
                  disabled={pending || !newLesson.title.trim()}
                  onClick={() => crearLeccion(m.id, newLesson.title)}
                >
                  Crear
                </Button>
                <Button size="sm" variant="outline" onClick={() => setNewLesson(null)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewLesson({ moduleId: m.id, title: "" })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Lección
                </button>
                <button
                  type="button"
                  onClick={() => setExamDialog({ moduleId: m.id, examen: null })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Examen
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Agregar módulo */}
      <div className="flex items-center gap-2 rounded-2xl border border-dashed p-4">
        <Input
          value={newModule}
          onChange={(e) => setNewModule(e.target.value)}
          placeholder="Título del nuevo módulo"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newModule.trim()) {
              startTransition(async () => {
                await addModule(courseId, newModule);
                setNewModule("");
                toast.success("Módulo creado");
              });
            }
          }}
        />
        <Button
          disabled={pending || !newModule.trim()}
          onClick={() =>
            startTransition(async () => {
              await addModule(courseId, newModule);
              setNewModule("");
              toast.success("Módulo creado");
            })
          }
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Módulo
        </Button>
      </div>

      {/* Diálogos */}
      {editingLesson && (
        <LeccionEditorDialog
          key={editingLesson.id}
          courseId={courseId}
          leccion={editingLesson}
          open={!!editingLesson}
          onOpenChange={(o) => !o && setEditingLesson(null)}
        />
      )}

      {examDialog && (
        <ExamenEditorDialog
          key={examDialog.examen?.id ?? `new-${examDialog.moduleId}`}
          courseId={courseId}
          moduleId={examDialog.moduleId}
          examen={examDialog.examen}
          open={!!examDialog}
          onOpenChange={(o) => !o && setExamDialog(null)}
        />
      )}

      <Dialog open={!!deletingMod} onOpenChange={(o) => !o && setDeletingMod(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar módulo</DialogTitle>
            <DialogDescription>
              ¿Eliminar <strong>{deletingMod?.title}</strong>? Se borran sus
              lecciones y exámenes. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMod(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  if (!deletingMod) return;
                  await deleteModule(courseId, deletingMod.id);
                  toast.success("Módulo eliminado");
                  setDeletingMod(null);
                })
              }
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingItem} onOpenChange={(o) => !o && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eliminar {deletingItem?.item.kind === "exam" ? "examen" : "lección"}
            </DialogTitle>
            <DialogDescription>
              ¿Eliminar <strong>{deletingItem?.item.title}</strong>?
              {deletingItem?.item.kind === "exam"
                ? " Se borran sus preguntas y los intentos de los empleados."
                : " Se borra su contenido y el progreso asociado."}{" "}
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={pending} onClick={confirmarEliminarItem}>
              {pending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
