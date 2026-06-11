import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Configuración de Prisma 7: ruta del schema, migraciones, seed y la URL de conexión
// que usa el CLI de Prisma para migrar (antes vivía en el bloque datasource del schema).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
