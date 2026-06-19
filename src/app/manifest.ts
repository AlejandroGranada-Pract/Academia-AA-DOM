import type { MetadataRoute } from "next";

// Manifest de la PWA. Next genera /manifest.webmanifest y enlaza
// automáticamente <link rel="manifest"> en cada página.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Academia AA | DOM",
    short_name: "Academia",
    description:
      "Plataforma de formación corporativa — Ambiente Azul + DOM Design",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es-CO",
    background_color: "#1f1f1f",
    theme_color: "#1f1f1f",
    icons: [
      {
        src: "/Icon/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/Icon/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
