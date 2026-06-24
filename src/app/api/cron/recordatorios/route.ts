import { prisma } from "@/lib/db";
import { effectiveDueDate } from "@/lib/vencimiento";
import { mailEnabled } from "@/lib/mailer";
import { enviarRecordatorio } from "@/lib/emails";

// Recordatorios de vencimiento (digest por persona). Lo llama el Heroku
// Scheduler, p. ej.:
//   curl -fsS https://academia.ambienteazul.com.co/api/cron/recordatorios \
//        -H "Authorization: Bearer $CRON_SECRET"
//
// Envía a cada empleado/líder activo un correo con sus cursos pendientes cuya
// fecha límite vence dentro de UMBRAL_DIAS o ya está vencida. Un correo por
// persona como máximo (solo si tiene pendientes).

const UMBRAL_DIAS = 7;
const LEARNER_ROLES = ["EMPLOYEE", "AREA_LEADER"] as const;
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fmt(d: Date) {
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("CRON_SECRET no configurado", { status: 503 });
  }
  const auth = req.headers.get("authorization");
  const token = new URL(req.url).searchParams.get("token");
  if (auth !== `Bearer ${secret}` && token !== secret) {
    return new Response("No autorizado", { status: 401 });
  }
  if (!mailEnabled()) {
    return Response.json({ ok: false, motivo: "correo no configurado" });
  }

  const ahora = new Date();
  const limite = new Date(ahora.getTime() + UMBRAL_DIAS * 24 * 60 * 60 * 1000);

  const [usuarios, cursos, certificados] = await Promise.all([
    prisma.user.findMany({
      where: { active: true, role: { in: [...LEARNER_ROLES] } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        grupos: { select: { id: true } },
        assignments: { select: { courseId: true } },
      },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        category: true,
        dueDate: true,
        dueDays: true,
        createdAt: true,
        grupos: { select: { id: true } },
      },
    }),
    prisma.certificate.findMany({ select: { userId: true, courseId: true } }),
  ]);

  // Cursos completados por usuario (tienen certificado).
  const completados = new Set(certificados.map((c) => `${c.userId}:${c.courseId}`));

  let enviados = 0;
  for (const u of usuarios) {
    if (!u.email) continue;
    const grupoIds = new Set(u.grupos.map((g) => g.id));
    const asignados = new Set(u.assignments.map((a) => a.courseId));

    const pendientes: { title: string; fecha: string; vencido: boolean }[] = [];
    for (const c of cursos) {
      const elegible =
        c.category === "INDUCCION" ||
        asignados.has(c.id) ||
        c.grupos.some((g) => grupoIds.has(g.id));
      if (!elegible) continue;
      if (completados.has(`${u.id}:${c.id}`)) continue;
      const due = effectiveDueDate(c, u.createdAt);
      if (!due) continue;
      if (due <= limite) {
        pendientes.push({ title: c.title, fecha: fmt(due), vencido: due < ahora });
      }
    }

    if (pendientes.length) {
      // primero los vencidos, luego por fecha más próxima
      pendientes.sort((a, b) => Number(b.vencido) - Number(a.vencido));
      await enviarRecordatorio({
        to: u.email,
        nombre: u.name?.split(" ")[0] ?? "",
        cursos: pendientes,
      });
      enviados++;
    }
  }

  return Response.json({ ok: true, usuarios: usuarios.length, enviados });
}
