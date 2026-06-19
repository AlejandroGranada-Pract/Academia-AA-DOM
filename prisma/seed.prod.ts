import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ============================================================================
// Seed de PRODUCCIÓN — seguro e idempotente.
//
// A diferencia de prisma/seed.ts (desarrollo), este script:
//   - NO borra nada (no hay deleteMany): se puede correr en prod sin riesgo.
//   - NO trae usuarios ni contraseñas en el código: el admin se lee de variables
//     de entorno (ADMIN_EMAIL / ADMIN_PASSWORD), así nada sensible vive en el repo.
//   - Se puede correr varias veces (usa upsert).
//
// Roles y categorías de curso son enums del esquema: existen automáticamente
// tras `prisma migrate deploy`. No hay que "migrarlos".
//
// Uso (una vez desplegado, con las env de producción):
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... DATABASE_URL=... npm run db:seed:prod
// ============================================================================

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrador";

  if (!email || !password) {
    throw new Error(
      "Faltan variables: define ADMIN_EMAIL y ADMIN_PASSWORD en el entorno antes de correr el seed de producción.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    // Re-correrlo rota la contraseña a la de la env y reactiva la cuenta.
    update: { name, passwordHash, role: "SUPER_ADMIN", active: true },
    create: {
      email,
      name,
      passwordHash,
      role: "SUPER_ADMIN",
      company: "AMBAS",
      area: "Administración",
    },
  });

  console.log(`✅ Admin listo: ${admin.email}`);
  console.log(
    "ℹ️  Roles y categorías de curso son enums del esquema: ya existen tras 'prisma migrate deploy'.",
  );
  console.log(
    "ℹ️  Los cursos se crean desde el panel (editor / asistente IA) o con un import aparte.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
