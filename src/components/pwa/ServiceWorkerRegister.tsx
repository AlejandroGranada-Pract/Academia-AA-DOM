"use client";

import { useEffect } from "react";

// Registra el service worker SOLO en producción (en dev cachearía y estorbaría
// el hot-reload). Es lo que habilita "instalar app" / icono en pantalla de inicio.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin SW la app sigue funcionando, solo no es instalable */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
