import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Quita las FECHAS DE VENCIMIENTO de los cursos en toda la base (los exámenes SÍ
// conservan su cronómetro). Idempotente. Apunta a DATABASE_URL (local o prod).

const cs = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: cs,
    ...(/localhost|127\.0\.0\.1/.test(cs) ? {} : { ssl: { rejectUnauthorized: false } }),
  }),
});

async function main() {
  const cursosDate = await prisma.course.updateMany({
    where: { dueDate: { not: null } },
    data: { dueDate: null },
  });
  const cursosDays = await prisma.course.updateMany({
    where: { dueDays: { not: null } },
    data: { dueDays: null },
  });
  const asignaciones = await prisma.courseAssignment.updateMany({
    where: { dueDate: { not: null } },
    data: { dueDate: null },
  });
  console.log(
    `✅ Cursos sin fecha fija: ${cursosDate.count} | Cursos sin plazo: ${cursosDays.count} | Asignaciones sin fecha: ${asignaciones.count}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
