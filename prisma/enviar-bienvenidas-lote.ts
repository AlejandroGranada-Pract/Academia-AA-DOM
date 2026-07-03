import "dotenv/config";
import { mailEnabled } from "../src/lib/mailer";
import { enviarBienvenida } from "../src/lib/emails";

// Envía el correo de bienvenida (con la contraseña) a los usuarios creados en
// lote, que se crearon SIN correo. Mismos datos que crear-usuarios-lote.ts.
// Idempotente en el sentido de que se puede reejecutar; reenvía el correo.

const PASSWORD = "Academia2026*";

const USERS: { name: string; email: string }[] = [
  { name: "Kevin", email: "arquitectura@ambienteazul.com.co" },
  { name: "Paula Bedoya", email: "sst@ambienteazul.com.co" },
  { name: "Lina Cano", email: "linacano@ambienteazul.com.co" },
  { name: "María Juanita", email: "auxcomercial@ambienteazul.com.co" },
  { name: "Miguel Simson", email: "comercialmed@domdesign.co" },
  { name: "Katherin Obregón", email: "k.obregon@ambienteazul.com.co" },
  { name: "Isabel Ramírez", email: "isa@domdesign.co" },
  { name: "Carlos Andrés", email: "delineante@ambienteazul.com.co" },
  { name: "Sophia Orquijo", email: "directorbogota@ambienteazul.com.co" },
  { name: "Andrés Flórez", email: "andresflorez@ambienteazul.com.co" },
  { name: "Camilo Urrego", email: "dircompras@domdesign.co" },
  { name: "Felipe Isaza", email: "analistacompras@ambienteazul.com.co" },
  { name: "Daniela Orozco", email: "auxcontable@ambienteazul.com.co" },
  { name: "Juan Pablo", email: "juanpablo@ambienteazul.com.co" },
  { name: "Jordan Bustos", email: "bustosjordan10@gmail.com" },
  { name: "Ronal Urrego", email: "bodega@ambienteazul.com.co" },
];

async function main() {
  if (!mailEnabled()) {
    console.error("❌ El correo no está configurado (faltan variables SMTP_*).");
    process.exit(1);
  }
  // Si se pasan correos como argumentos, solo se envía a esos (para no reenviar
  // a todo el lote). Ej: npx tsx prisma/enviar-bienvenidas-lote.ts bodega@ambienteazul.com.co
  const filtro = process.argv.slice(2).map((e) => e.trim().toLowerCase());
  const objetivo = filtro.length
    ? USERS.filter((u) => filtro.includes(u.email.trim().toLowerCase()))
    : USERS;
  if (!objetivo.length) {
    console.error("❌ Ningún usuario coincide con el filtro:", filtro.join(", "));
    process.exit(1);
  }
  let ok = 0;
  let fail = 0;
  for (const u of objetivo) {
    const email = u.email.trim().toLowerCase();
    try {
      await enviarBienvenida({
        to: email,
        nombre: u.name.split(" ")[0] || u.name,
        email,
        password: PASSWORD,
      });
      console.log(`✅ enviado: ${u.name} <${email}>`);
      ok++;
    } catch (e) {
      console.error(`❌ falló: ${email} —`, e);
      fail++;
    }
  }
  console.log(`\nResumen: ${ok} enviado(s), ${fail} con error.`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
