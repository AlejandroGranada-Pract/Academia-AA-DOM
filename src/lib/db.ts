import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton de Prisma Client (Prisma 7 con driver adapter @prisma/adapter-pg).
// Evita crear múltiples conexiones en desarrollo por el hot-reload de Next.js.
const connectionString = process.env.DATABASE_URL!;
// En producción (Heroku) Postgres exige SSL con certificado self-signed; en
// local (localhost) no se usa SSL.
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
