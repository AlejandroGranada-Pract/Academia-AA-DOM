import nodemailer, { type Transporter } from "nodemailer";

// Envío de correos por SMTP (Google Workspace). La configuración vive en
// variables de entorno; si faltan, el envío es un no-op silencioso (así el
// deploy y el desarrollo funcionan sin correo hasta que se configure).
//
// Variables:
//   SMTP_HOST   (ej. smtp.gmail.com)
//   SMTP_PORT   (465 SSL / 587 TLS)
//   SMTP_USER   (cuenta que envía, ej. notificaciones@ambienteazul.com.co)
//   SMTP_PASS   (App Password de Google — se pone en Heroku, no en el código)
//   MAIL_FROM   (remitente visible, ej. "Academia AA | DOM <notificaciones@ambienteazul.com.co>")

let cached: Transporter | null | undefined;

function getTransport(): Transporter | null {
  if (cached !== undefined) return cached;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    cached = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL; 587 = STARTTLS
    auth: { user, pass },
  });
  return cached;
}

export function mailEnabled(): boolean {
  return getTransport() !== null;
}

function fromAddress(): string {
  return (
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    "Academia AA | DOM <no-reply@ambienteazul.com.co>"
  );
}

// Enlace base de la app (para botones/links en los correos).
export function appUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "https://academia.ambienteazul.com.co"
  );
}

// Envía un correo. Nunca lanza: las notificaciones no deben tumbar la acción
// que las dispara. Devuelve true si se envió.
export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.warn("[mailer] SMTP no configurado; se omite:", opts.subject);
    return false;
  }
  try {
    await t.sendMail({
      from: fromAddress(),
      to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (e) {
    console.error("[mailer] error enviando:", opts.subject, e);
    return false;
  }
}
