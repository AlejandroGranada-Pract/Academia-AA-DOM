import { createHash } from "crypto";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { verificarTokenSso } from "@/lib/sso-token";
import { consumirJti, buscarOCrearUsuarioSso } from "@/lib/sso";
import { loginBloqueado, registrarFalloLogin, limpiarFallosLogin } from "@/lib/login-throttle";

// Huella corta del hash de contraseña: cambia cuando el admin la restablece.
function passwordVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
}

// Config completa (runtime Node): añade el provider de credenciales que valida
// email/contraseña contra la base de datos con bcrypt.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // En Node (páginas, server actions, route handlers) la sesión se revalida
    // contra la BD en cada uso: un usuario desactivado, eliminado o con la
    // contraseña restablecida pierde el acceso de inmediato, y el rol/empresa
    // siempre son los actuales. También aplica aquí la expiración efectiva
    // (absExp), no solo en el middleware.
    async jwt(params) {
      const token = authConfig.callbacks.jwt(params) as JWT;
      const now = Math.floor(Date.now() / 1000);
      if (token.absExp && now > token.absExp) return null;
      if (!token.id) return null;

      const u = await prisma.user.findUnique({
        where: { id: token.id },
        select: { active: true, role: true, company: true, passwordHash: true },
      });
      if (!u || !u.active) return null;

      const pwv = passwordVersion(u.passwordHash);
      if (params.user) token.pwv = pwv;
      else if (token.pwv !== pwv) return null;

      token.role = u.role;
      token.company = u.company;
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
        remember: { label: "Recuérdame", type: "checkbox" },
      },
      authorize: async (credentials) => {
        // Normaliza el correo: sin espacios y en minúsculas (así se guardan),
        // para que el login no falle por mayúsculas/minúsculas.
        const email = (credentials?.email as string | undefined)
          ?.trim()
          .toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (loginBloqueado(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) {
          registrarFalloLogin(email);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          registrarFalloLogin(email);
          return null;
        }
        limpiarFallosLogin(email);

        // "Recuérdame": el form envía "true" si está marcado.
        const remember = credentials?.remember === "true";

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          remember,
        };
      },
    }),

    // Provider interno para el SSO desde la intranet: recibe el token de
    // paso, lo valida (firma/aud/exp), lo consume (un solo uso) y hace
    // find-or-create del usuario. No tiene UI: solo lo llama /api/sso.
    Credentials({
      id: "sso",
      credentials: { token: {} },
      authorize: async (credentials) => {
        const token = credentials?.token as string | undefined;
        if (!token) return null;

        const payload = await verificarTokenSso(token);
        if (!payload) return null;

        // Un solo uso: si el jti ya fue canjeado, rechazar (anti-replay).
        if (!(await consumirJti(payload.jti))) return null;

        const user = await buscarOCrearUsuarioSso(payload.email, payload.nombre);
        if (!user.active) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          remember: false, // sesión de 1 día; puede volver a entrar desde la intranet
        };
      },
    }),
  ],
});
