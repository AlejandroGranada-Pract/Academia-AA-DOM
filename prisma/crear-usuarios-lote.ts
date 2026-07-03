import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});
const prisma = new PrismaClient({ adapter });

// Crea usuarios en lote (rol EMPLOYEE, empresa AMBAS, sin grupo). Usa prisma
// directo, así que NO envía correo de bienvenida. Idempotente: si el correo ya
// existe, lo omite. La contraseña es la misma para todos.

const PASSWORD = "Academia2026*";

type Role = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";

// Correos en minúscula (el login no distingue mayúsculas). role por defecto EMPLOYEE.
const USERS: { name: string; email: string; role?: Role }[] = [
  { name: "Kevin", email: "arquitectura@ambienteazul.com.co" },
  { name: "Paula Bedoya", email: "sst@ambienteazul.com.co" },
  { name: "Lina Cano", email: "linacano@ambienteazul.com.co" },
  { name: "María Juanita", email: "auxcomercial@ambienteazul.com.co" },
  { name: "Miguel Simson", email: "comercialmed@domdesign.co" },
  { name: "Katherin Obregón", email: "k.obregon@ambienteazul.com.co" },
  { name: "Isabel Ramírez", email: "isa@domdesign.co", role: "SUPER_ADMIN" },
  { name: "Carlos Andrés", email: "delineante@ambienteazul.com.co" },
  { name: "Sophia Orquijo", email: "directorbogota@ambienteazul.com.co" },
  { name: "Andrés Flórez", email: "andresflorez@ambienteazul.com.co" },
  { name: "Camilo Urrego", email: "dircompras@domdesign.co" },
  { name: "Felipe Isaza", email: "analistacompras@ambienteazul.com.co" },
  { name: "Daniela Orozco", email: "auxcontable@ambienteazul.com.co" },
  { name: "Juan Pablo", email: "juanpablo@ambienteazul.com.co" },
  { name: "Jordan Bustos", email: "bustosjordan10@gmail.com" },
];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);
  let creados = 0;
  let existentes = 0;
  for (const u of USERS) {
    const email = u.email.trim().toLowerCase();
    const yaExiste = await prisma.user.findUnique({ where: { email } });
    if (yaExiste) {
      console.log(`⏭️  ya existe: ${email}`);
      existentes++;
      continue;
    }
    await prisma.user.create({
      data: {
        name: u.name,
        email,
        passwordHash: hash,
        role: u.role ?? "EMPLOYEE",
        company: "AMBAS",
        active: true,
      },
    });
    console.log(`✅ creado: ${u.name} <${email}> [${u.role ?? "EMPLOYEE"}]`);
    creados++;
  }
  console.log(`\nResumen: ${creados} creado(s), ${existentes} ya existía(n).`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
