import type { DefaultSession } from "next-auth";

// Roles y empresas (coinciden con los enums de Prisma)
type AppRole = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";
type AppCompany = "AMBIENTE_AZUL" | "DOM_DESIGN" | "AMBAS";

// Extiende los tipos de NextAuth para incluir id, role y company en la sesión/JWT.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      company: AppCompany;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    company: AppCompany;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    company: AppCompany;
  }
}
