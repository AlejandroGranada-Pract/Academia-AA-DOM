"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCourse, updateCourse } from "@/lib/actions/cursos";
import { useCierreGuard, ConfirmarSalir } from "@/components/admin/ConfirmarSalir";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring";

export type CursoFormData = {
  id?: string;
  title: string;
  description: string;
  category: string;
  company: string;
  estimatedHours: number | null;
  passingScore: number;
  dueDate: string | null; // yyyy-mm-dd (fecha fija)
  dueDays: number | null; // plazo en días relativo
  grupoIds: string[];
};

export function CursoFormDialog({
  open,
  onOpenChange,
  curso,
  grupos,
  goToEditorOnCreate = true,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  curso?: CursoFormData | null; // null/undefined = crear
  grupos: { id: string; name: string }[];
  goToEditorOnCreate?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const modoInicial = (c?: CursoFormData | null): "none" | "days" | "date" =>
    c?.dueDays != null ? "days" : c?.dueDate ? "date" : "none";
  const [dueMode, setDueMode] = useState<"none" | "days" | "date">(
    modoInicial(curso),
  );
  const [pending, startTransition] = useTransition();
  const isEdit = !!curso?.id;
  const guard = useCierreGuard(dirty, () => onOpenChange(false));

  // Resetea estado cada vez que se abre el diálogo.
  useEffect(() => {
    if (open) {
      setDirty(false);
      setDueMode(modoInicial(curso));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (isEdit && curso?.id) {
        const err = await updateCourse(curso.id, fd);
        if (err) return setError(err);
        setDirty(false);
        toast.success("Curso actualizado");
        onOpenChange(false);
      } else {
        const res = await createCourse(fd);
        if (res.error) return setError(res.error);
        setDirty(false);
        toast.success("Curso creado (inactivo)");
        onOpenChange(false);
        if (res.id && goToEditorOnCreate) {
          router.push(`/admin/cursos/${res.id}/edit`);
        }
      }
    });
  }

  return (
    <>
    <Dialog open={open} onOpenChange={guard.onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar curso" : "Nuevo curso"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del curso."
              : "El curso se crea inactivo; actívalo cuando esté listo."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          onChange={() => setDirty(true)}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={curso?.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={curso?.description}
              required
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                name="category"
                className={selectClass}
                defaultValue={curso?.category ?? "INDUCCION"}
              >
                <option value="INDUCCION">Inducción</option>
                <option value="CAPACITACION_AREA">Capacitación de área</option>
                <option value="FORMACION_CONTINUA">Formación continua</option>
                <option value="TECNICO">Técnico</option>
                <option value="PRODUCTO">Producto</option>
                <option value="PROCESO">Proceso</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <select
                id="company"
                name="company"
                className={selectClass}
                defaultValue={curso?.company ?? "AMBIENTE_AZUL"}
              >
                <option value="AMBIENTE_AZUL">Ambiente Azul</option>
                <option value="DOM_DESIGN">DOM Design</option>
                <option value="AMBAS">Ambas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="estimatedHours">Horas est.</Label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                defaultValue={curso?.estimatedHours ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passingScore">Mín. aprobar %</Label>
              <Input
                id="passingScore"
                name="passingScore"
                type="number"
                min="0"
                max="100"
                defaultValue={curso?.passingScore ?? 70}
              />
            </div>
          </div>

          {/* Fecha límite: sin límite / plazo en días (por empleado) / fecha fija */}
          <div className="space-y-1.5">
            <Label htmlFor="dueMode">Fecha límite</Label>
            <select
              id="dueMode"
              name="dueMode"
              className={selectClass}
              value={dueMode}
              onChange={(e) =>
                setDueMode(e.target.value as "none" | "days" | "date")
              }
            >
              <option value="none">Sin límite</option>
              <option value="days">Plazo en días (por empleado)</option>
              <option value="date">Fecha fija</option>
            </select>

            {dueMode === "days" && (
              <div className="space-y-1">
                <Input
                  name="dueDays"
                  type="number"
                  min="1"
                  placeholder="Ej. 30"
                  defaultValue={curso?.dueDays ?? ""}
                />
                <p className="text-xs text-muted-foreground">
                  Cada empleado tendrá esos días desde que ingresa o recibe el
                  curso. Ideal para inducciones (un empleado nuevo nunca lo verá
                  vencido por una fecha vieja).
                </p>
              </div>
            )}

            {dueMode === "date" && (
              <Input
                name="dueDate"
                type="date"
                defaultValue={curso?.dueDate ?? ""}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Grupos que lo ven</Label>
            <p className="text-xs text-muted-foreground">
              Inducción la ven todos sin importar el grupo.
            </p>
            {grupos.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay grupos creados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {grupos.map((g) => (
                  <label
                    key={g.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/8"
                  >
                    <input
                      type="checkbox"
                      name="grupoIds"
                      value={g.id}
                      defaultChecked={curso?.grupoIds.includes(g.id)}
                      className="accent-primary"
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => guard.onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

      <ConfirmarSalir
        open={guard.confirming}
        onKeep={guard.keepEditing}
        onLeave={guard.confirmLeave}
      />
    </>
  );
}
