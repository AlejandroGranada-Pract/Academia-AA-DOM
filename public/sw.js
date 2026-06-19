// Service worker mínimo de Academia AA | DOM.
// Objetivo: hacer la app instalable (icono en home screen) y dar una
// experiencia básica offline, SIN romper la autenticación ni los datos
// dinámicos. Por eso /api/ nunca se cachea y las navegaciones van a la red
// primero (cae a caché solo si no hay conexión).
const CACHE = "academia-v1";

// Estáticos seguros de cachear (no cambian sin un nuevo deploy).
const ESTATICOS = ["/_next/", "/Icon/", "/videos/"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Nunca cachear API ni imágenes servidas desde la base (datos dinámicos/auth).
  if (url.pathname.startsWith("/api/")) return;

  // Navegaciones (HTML): red primero, caché o aviso offline como respaldo.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then(
          (cached) =>
            cached ||
            new Response("Sin conexión. Vuelve a intentar cuando tengas red.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            }),
        ),
      ),
    );
    return;
  }

  // Estáticos: caché primero; el resto, red directa.
  const esEstatico = ESTATICOS.some((p) => url.pathname.startsWith(p));
  if (!esEstatico) return;

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        }),
    ),
  );
});
