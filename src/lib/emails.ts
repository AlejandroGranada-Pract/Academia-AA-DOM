import { appUrl, sendMail } from "@/lib/mailer";

// Plantillas de correo con la identidad AA | DOM. Cada función arma el HTML y
// lo envía. Estilos inline (los clientes de correo no leen <style> externos).

const AZUL = "#3a86c8";
const ORO = "#BE9B60";
const DARK = "#1F1F1F";

function layout(opts: {
  titulo: string;
  cuerpo: string; // HTML del contenido
  ctaTexto?: string;
  ctaUrl?: string;
}): string {
  const cta =
    opts.ctaTexto && opts.ctaUrl
      ? `<tr><td style="padding:8px 0 4px">
           <a href="${opts.ctaUrl}" style="display:inline-block;background:${AZUL};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px;font-size:14px">${opts.ctaTexto}</a>
         </td></tr>`
      : "";
  return `
  <div style="background:#f4f4f2;padding:24px 0;font-family:Segoe UI,Arial,Helvetica,sans-serif;color:#2b2b2b">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececec">
          <tr><td style="background:${DARK};padding:18px 28px">
            <span style="color:${AZUL};font-weight:bold;letter-spacing:1px;font-size:14px">AMBIENTE AZUL</span>
            <span style="color:#777;margin:0 6px">|</span>
            <span style="color:${ORO};font-weight:bold;letter-spacing:3px;font-size:14px">DOM</span>
            <div style="color:#9a9a9a;font-size:9px;letter-spacing:2px;margin-top:3px">ACADEMIA DE FORMACIÓN</div>
          </td></tr>
          <tr><td style="padding:28px">
            <h1 style="margin:0 0 14px;font-size:20px;color:${DARK}">${opts.titulo}</h1>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#3a3a3a">
              <tr><td>${opts.cuerpo}</td></tr>
              ${cta}
            </table>
          </td></tr>
          <tr><td style="padding:16px 28px;border-top:1px solid #f0f0f0;color:#aaaaaa;font-size:11px">
            Academia AA | DOM · Este es un correo automático, no respondas a este mensaje.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

// 1) Bienvenida con acceso (al crear el usuario)
export async function enviarBienvenida(p: {
  to: string;
  nombre: string;
  email: string;
  password: string;
}) {
  const url = `${appUrl()}/login`;
  const html = layout({
    titulo: `¡Bienvenido/a, ${p.nombre}!`,
    cuerpo: `
      <p style="margin:0 0 12px">Ya tienes acceso a la <strong>Academia AA | DOM</strong>, nuestra plataforma de formación.</p>
      <p style="margin:0 0 6px">Ingresa con estos datos:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 14px;font-size:14px">
        <tr><td style="padding:3px 12px 3px 0;color:#888">Correo</td><td style="font-weight:bold">${p.email}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#888">Contraseña</td><td style="font-weight:bold">${p.password}</td></tr>
      </table>
      <p style="margin:0 0 14px;color:#888;font-size:13px">Te recomendamos marcar “Recuérdame” al ingresar.</p>`,
    ctaTexto: "Ingresar a la Academia",
    ctaUrl: url,
  });
  await sendMail({ to: p.to, subject: "Tu acceso a la Academia AA | DOM", html });
}

// 2) Curso asignado
export async function enviarCursoAsignado(p: {
  to: string | string[];
  cursoTitle: string;
}) {
  const url = `${appUrl()}/cursos`;
  const html = layout({
    titulo: "Tienes un curso nuevo",
    cuerpo: `
      <p style="margin:0 0 12px">Se te asignó el curso <strong>${p.cursoTitle}</strong> en la Academia.</p>
      <p style="margin:0 0 14px">Ya está disponible para que lo tomes cuando quieras.</p>`,
    ctaTexto: "Ver mis cursos",
    ctaUrl: url,
  });
  await sendMail({ to: p.to, subject: `Nuevo curso: ${p.cursoTitle}`, html });
}

// 3) Certificado al completar
export async function enviarCertificado(p: {
  to: string;
  nombre: string;
  cursoTitle: string;
  certId: string;
}) {
  const url = `${appUrl()}/api/certificados/${p.certId}`;
  const html = layout({
    titulo: `¡Felicitaciones, ${p.nombre}! 🎉`,
    cuerpo: `
      <p style="margin:0 0 12px">Completaste el curso <strong>${p.cursoTitle}</strong>.</p>
      <p style="margin:0 0 14px">Tu certificado ya está disponible para descargar.</p>`,
    ctaTexto: "Descargar certificado",
    ctaUrl: url,
  });
  await sendMail({
    to: p.to,
    subject: `Certificado: ${p.cursoTitle}`,
    html,
  });
}

// 4) Recordatorio de vencimientos (digest por persona)
export async function enviarRecordatorio(p: {
  to: string;
  nombre: string;
  cursos: { title: string; fecha: string; vencido: boolean }[];
}) {
  const filas = p.cursos
    .map(
      (c) =>
        `<tr>
          <td style="padding:6px 12px 6px 0;border-bottom:1px solid #f0f0f0">${c.title}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:${c.vencido ? "#c0392b" : "#9c7d3f"};font-weight:bold;white-space:nowrap">${c.vencido ? "Vencido" : "Vence"} · ${c.fecha}</td>
        </tr>`,
    )
    .join("");
  const html = layout({
    titulo: `Hola, ${p.nombre}`,
    cuerpo: `
      <p style="margin:0 0 12px">Tienes cursos pendientes con fecha límite cercana o vencida:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin:0 0 14px">${filas}</table>
      <p style="margin:0 0 14px">Entra a la Academia para ponerte al día.</p>`,
    ctaTexto: "Ir a mis cursos",
    ctaUrl: `${appUrl()}/cursos`,
  });
  await sendMail({
    to: p.to,
    subject: "Recordatorio: cursos pendientes en la Academia",
    html,
  });
}
