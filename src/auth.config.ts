import type { NextAuthConfig } from "next-auth";

// Configuración EDGE-SAFE de NextAuth: sin Prisma ni bcrypt (los usa el middleware,
// que corre en edge runtime). El provider de credenciales se agrega en src/auth.ts.
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // La cookie/JWT vive hasta 30 días. La duración EFECTIVA la decide "Recuérdame":
  // marcado → 30 días; sin marcar → 1 día (se aplica vía `absExp`, ver callbacks).
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    // Protección de rutas en el middleware.
    authorized({ auth, request: { nextUrl } }) {
      // Sesión válida = hay usuario Y no venció la expiración efectiva (absExp).
      // Sin "Recuérdame" la sesión caduca antes aunque la cookie siga viva.
      const now = Math.floor(Date.now() / 1000);
      const expired = !!auth?.absExp && now > auth.absExp;
      const isLoggedIn = !!auth?.user && !expired;
      const isOnLogin = nextUrl.pathname === "/login";

      // Verificación pública de certificados (vía QR): sin login.
      if (nextUrl.pathname.startsWith("/verificar")) return true;

      // En /login: si ya está logueado, lo mandamos al dashboard (ruta "/").
      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Cualquier otra ruta requiere sesión.
      return isLoggedIn;
    },
    // Pasa id, role y company al JWT. En el login fija la expiración efectiva
    // según "Recuérdame"; se conserva en las renovaciones posteriores.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.company = user.company;
        const dias = user.remember ? 30 : 1;
        token.absExp = Math.floor(Date.now() / 1000) + dias * 24 * 60 * 60;
      }
      return token;
    },
    // Expone esos campos en la sesión que consume la app.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role =
          token.role as (typeof session.user)["role"];
        session.user.company =
          token.company as (typeof session.user)["company"];
      }
      session.absExp = token.absExp as number | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
