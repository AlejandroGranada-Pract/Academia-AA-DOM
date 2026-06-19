import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuración de Prisma 7: ruta del schema, migraciones, seed y la URL de conexión
// que usa el CLI de Prisma para migrar (antes vivía en el bloque datasource del schema).

// Heroku Postgres exige SSL pero su DATABASE_URL no trae sslmode. Para que
// `prisma migrate deploy` conecte en producción, le añadimos sslmode=require
// (cifra sin verificar el certificado self-signed). En local no se toca.
const raw = process.env.DATABASE_URL ?? "";
const isLocal = /localhost|127\.0\.0\.1/.test(raw);
const url =
  raw && !isLocal && !/sslmode=/.test(raw)
    ? raw + (raw.includes("?") ? "&" : "?") + "sslmode=require"
    : raw;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url,
  },
});
