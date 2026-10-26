import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// El middleware usa solo la config edge-safe. La protección la decide el
// callback `authorized` de authConfig.
export default NextAuth(authConfig).auth;

export const config = {
  // Corre en todas las rutas excepto assets estáticos y los endpoints de auth.
  // api/sso se excluye: es el punto de canje del SSO y debe recibir requests
  // sin sesión (valida su propio token de paso).
  // Importante: excluir también media (mp4/webm) y fuentes, o el middleware los
  // redirige a /login y no cargan (ej. el video de fondo del login).
  matcher: [
    "/((?!api/auth|api/cron|api/sso|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|svg|ico|mp4|webm|woff2?)$).*)",
  ],
};
