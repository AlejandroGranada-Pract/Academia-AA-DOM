"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Guarda para diálogos de edición: si hay cambios sin guardar y el usuario
// intenta cerrar (X, clic afuera, Escape o "Cancelar"), pide confirmación.
//
// Uso:
//   const guard = useCierreGuard(dirty, () => onOpenChange(false));
//   <Dialog open={open} onOpenChange={guard.onOpenChange}> ... </Dialog>
//   ...al guardar con éxito: onOpenChange(false)  (cierre directo, no hay cambios)
//   <ConfirmarSalir open={guard.confirming} onKeep={...} onLeave={...} />
export function useCierreGuard(dirty: boolean, close: () => void) {
  const [confirming, setConfirming] = useState(false);
  return {
    confirming,
    onOpenChange: (next: boolean) => {
      if (next) return; // abrir no se intercepta
      if (dirty) setConfirming(true);
      else close();
    },
    keepEditing: () => setConfirming(false),
    confirmLeave: () => {
      setConfirming(false);
      close();
    },
  };
}

export function ConfirmarSalir({
  open,
  onKeep,
  onLeave,
}: {
  open: boolean;
  onKeep: () => void;
  onLeave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onKeep()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-warning/15 text-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Cambios sin guardar</DialogTitle>
          <DialogDescription className="text-center">
            Tienes cambios que no has guardado. Si sales ahora se perderán.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onKeep}>
            Seguir editando
          </Button>
          <Button variant="destructive" onClick={onLeave}>
            Salir sin guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Guard de navegación INTERNA: cuando hay cambios sin guardar e intentas
// navegar a otra página (sidebar, links), intercepta el clic y muestra el
// diálogo bonito en vez de dejarte salir sin avisar.
export function useNavGuard(dirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dirtyRef.current) return;
      // Clics modificados (nueva pestaña, etc.) o no-izquierdo: dejar pasar.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL((a as HTMLAnchorElement).href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // externo
      if (url.pathname === window.location.pathname) return; // misma página
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search);
    }
    document.addEventListener("click", onClick, true); // fase de captura
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return {
    confirming: pendingHref !== null,
    keepEditing: () => setPendingHref(null),
    confirmLeave: () => {
      const href = pendingHref;
      setPendingHref(null);
      if (href) router.push(href);
    },
  };
}
