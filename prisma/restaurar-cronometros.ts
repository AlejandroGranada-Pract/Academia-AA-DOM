import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Restaura el tiempo límite (cronómetro) de los exámenes de Inducción y
// Fundamentos de Piscinas, según los valores originales de los seeds. Se
// identifican por título. Idempotente. (El curso de Claude recupera sus tiempos
// al re-sembrarlo con su propio script.)

const cs = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: cs,
    ...(/localhost|127\.0\.0\.1/.test(cs) ? {} : { ssl: { rejectUnauthorized: false } }),
  }),
});

// Título exacto del examen → minutos originales.
const TIEMPOS: Record<string, number> = {
  "Evaluación final de Inducción": 10,
  "Evaluación — Concepto de Piscina": 10,
  "Evaluación — Anatomía de una Piscina": 15,
  "Evaluación — Normativa Colombiana": 20,
  "Evaluación — Hidráulica Básica": 15,
  "Evaluación — Cuarto Técnico de Máquinas": 15,
  "Evaluación — Sistemas Esenciales": 15,
  "Evaluación — Cotización Completa": 12,
};

async function main() {
  let total = 0;
  for (const [title, min] of Object.entries(TIEMPOS)) {
    const r = await prisma.exam.updateMany({
      where: { title },
      data: { timeLimitMin: min },
    });
    console.log(`  ${r.count > 0 ? "✅" : "⚠️ "} ${title} → ${min} min (${r.count})`);
    total += r.count;
  }
  console.log(`\nTotal exámenes restaurados: ${total}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
