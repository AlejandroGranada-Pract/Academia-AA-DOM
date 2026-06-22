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

// Oculta el chrome de la app (sidebar, barra móvil) dentro del iframe para que
// la vista previa muestre solo el contenido del curso. El iframe es del mismo
// origen, así que podemos inyectar estilos a su documento.
function ocultarChrome(e: React.SyntheticEvent<HTMLIFrameElement>) {
  try {
    const doc = e.currentTarget.contentDocument;
    if (!doc || doc.getElementById("preview-style")) return;
    const style = doc.createElement("style");
    style.id = "preview-style";
    style.textContent =
      'aside,header[class*="md:hidden"],nav[class*="bottom-0"]{display:none!important}' +
      'div[class*="pl-[260px]"]{padding-left:0!important}' +
      "main{padding:1.5rem!important}";
    doc.head.appendChild(style);
  } catch {
    /* distinto origen: no se puede, se deja la vista completa */
  }
}

// Vista previa del curso "como empleado" en un modal (no redirige). Carga la
// vista real del curso en un iframe.
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
              src={`/cursos/${courseId}`}
              title="Vista previa del curso"
              onLoad={ocultarChrome}
              className="h-full w-full flex-1 border-0 bg-background"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
