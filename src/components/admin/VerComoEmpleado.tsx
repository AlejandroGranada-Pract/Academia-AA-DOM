"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Vista previa del curso "como empleado" en un modal (no redirige). Carga la
// vista real del curso en un iframe; la app detecta que está embebida y oculta
// su propio chrome (sidebar/barras) — ver PreviewMode + .is-preview en CSS.
export function VerComoEmpleado({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
        Ver como empleado
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[88vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>Vista previa — como empleado</DialogTitle>
          </DialogHeader>
          {open && (
            <iframe
              src={`/cursos/${courseId}?preview=1`}
              title="Vista previa del curso"
              className="h-full w-full flex-1 border-0 bg-background"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
