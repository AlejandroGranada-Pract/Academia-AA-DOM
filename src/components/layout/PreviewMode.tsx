"use client";

import { useEffect } from "react";

// Cuando la app se renderiza dentro de un iframe (la vista previa "Ver como
// empleado"), marca <html> con .is-preview para ocultar el chrome (sidebar /
// barras) vía CSS. Solo embebemos la app en ese modal, así que es seguro.
export function PreviewMode() {
  useEffect(() => {
    if (window.self !== window.top) {
      document.documentElement.classList.add("is-preview");
    }
  }, []);
  return null;
}
