import type { NextAuthConfig } from "next-auth";

// Configuración EDGE-SAFE de NextAuth: sin Prisma ni bcrypt (los usa el middleware,
// que corre en edge runtime). El provider de credenciales se agrega en src/auth.ts.
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // Sesión de 2 días: balance entre comodidad (no loguearse a diario)
  // y seguridad (la sesión no queda abierta por semanas).
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 2 },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    // Protección de rutas en el middleware.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname === "/login";

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
    // Pasa id, role y company del usuario al token JWT.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.company = user.company;
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
      return session;
    },
  },
} satisfies NextAuthConfig;
