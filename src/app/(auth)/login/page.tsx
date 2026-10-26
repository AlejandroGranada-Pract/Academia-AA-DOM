import { LoginForm } from "@/components/auth/LoginForm";
import { VideoFondo } from "@/components/auth/VideoFondo";

const MENSAJES_ERROR: Record<string, string> = {
  sso: "El enlace desde la intranet expiró o ya fue usado. Vuelve a la intranet e intenta de nuevo.",
  "sso-inactivo": "Tu cuenta de la Academia está desactivada. Contacta al administrador.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const mensajeError = searchParams?.error
    ? MENSAJES_ERROR[searchParams.error]
    : undefined;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-grafito via-[#2a2a2a] to-grafito p-5">
      {/* Video de fondo con carga diferida: el login pinta de inmediato
          (degradado) y el video aparece con fade cuando está listo. */}
      <VideoFondo src="/videos/VideoAALogin.mp4" />

      {/* Capa oscura (más densa arriba/abajo) para legibilidad sin tapar el video */}
      <div className="absolute inset-0 bg-gradient-to-b from-grafito/85 via-grafito/45 to-grafito/90" />

      {/* Contenido del login (por encima del video) */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logos AA | DOM (con sombra para contraste sobre el video) */}
        <div className="mb-3 flex items-center justify-center gap-5 [&_span]:drop-shadow-lg">
          <span className="font-heading text-2xl tracking-wider text-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-9 w-px bg-white/30" />
          <span className="font-heading text-2xl tracking-[0.25em] text-gold">
            DOM
          </span>
        </div>
        <p className="mb-10 text-center text-xs uppercase tracking-[0.2em] text-white/70 drop-shadow">
          Academia de Formación
        </p>

        {/* Tarjeta con efecto vidrio oscuro */}
        <div className="rounded-2xl border border-white/15 bg-grafito/40 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
          <h1 className="mb-1 text-3xl text-white">Bienvenido</h1>
          <p className="mb-7 text-sm text-white/55">
            Ingresa con tus credenciales para continuar
          </p>
          {mensajeError && (
            <p
              className="mb-5 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {mensajeError}
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
