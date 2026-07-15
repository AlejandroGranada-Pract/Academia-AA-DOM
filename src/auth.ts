import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { verificarTokenSso } from "@/lib/sso-token";
import { consumirJti, buscarOCrearUsuarioSso } from "@/lib/sso";

// Config completa (runtime Node): añade el provider de credenciales que valida
// email/contraseña contra la base de datos con bcrypt.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

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
