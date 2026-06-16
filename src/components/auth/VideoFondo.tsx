"use client";

import { useEffect, useState } from "react";

// Video de fondo del login con carga diferida: la página pinta de inmediato
// (se ve el degradado) y el video aparece con fade cuando ya puede reproducirse.
export function VideoFondo({ src }: { src: string }) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Monta el <video> después del primer paint para no competir con el render.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      onCanPlay={() => setReady(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
