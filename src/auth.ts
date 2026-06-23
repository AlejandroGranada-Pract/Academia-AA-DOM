import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";

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
  ],
});
