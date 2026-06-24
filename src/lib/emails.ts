import { appUrl, sendMail } from "@/lib/mailer";

// Plantillas de correo con la identidad AA | DOM. HTML basado en tablas + estilos
// inline (los clientes de correo, como Gmail, ignoran los <style> externos y no
// soportan flex/grid de forma fiable).

const AZUL = "#3a86c8"; // azul AA legible sobre blanco
const AZUL_TINT = "#eaf3fb";
const ORO = "#a07d3e"; // dorado DOM legible
const ORO_TINT = "#f6efe2";
const DARK = "#1F1F1F";
const TEXT = "#3a3a3a";
const MUTED = "#8a8f98";

type Shell = {
  preheader: string; // texto de vista previa en la bandeja
  eyebrow: string; // etiqueta tipo "pill"
  color: string; // color de acento (azul/oro/…)
  tint: string; // fondo suave del pill
  titulo: string;
  cuerpo: string; // HTML del contenido
  ctaTexto?: string;
  ctaUrl?: string;
};

function shell(o: Shell): string {
  const btn =
    o.ctaTexto && o.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px">
           <tr><td align="center" bgcolor="${o.color}" style="border-radius:12px">
             <a href="${o.ctaUrl}" target="_blank"
                style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:12px;font-family:'Segoe UI',Arial,sans-serif">
               ${o.ctaTexto} &nbsp;&rarr;
             </a>
           </td></tr>
         </table>`
      : "";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f1f0ed">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${o.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f0ed;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(31,31,31,0.10);font-family:'Segoe UI',Arial,Helvetica,sans-serif">

        <!-- Encabezado -->
        <tr><td style="background:${DARK};padding:22px 32px">
          <span style="color:${"#76B8E0"};font-weight:bold;letter-spacing:1px;font-size:15px">AMBIENTE AZUL</span>
          <span style="color:#666;margin:0 7px">|</span>
          <span style="color:${"#BE9B60"};font-weight:bold;letter-spacing:4px;font-size:15px">DOM</span>
          <div style="color:#9a9a9a;font-size:9.5px;letter-spacing:2.5px;margin-top:4px">ACADEMIA DE FORMACIÓN</div>
        </td></tr>
        <!-- Barra de acento bicolor -->
        <tr><td style="padding:0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td height="4" style="background:#76B8E0;font-size:0;line-height:0">&nbsp;</td>
            <td height="4" style="background:#BE9B60;font-size:0;line-height:0">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Cuerpo -->
        <tr><td style="padding:34px 34px 30px">
          <span style="display:inline-block;background:${o.tint};color:${o.color};font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;padding:5px 12px;border-radius:999px">${o.eyebrow}</span>
          <h1 style="margin:16px 0 14px;font-size:23px;line-height:1.25;color:${DARK}">${o.titulo}</h1>
          <div style="font-size:15px;line-height:1.65;color:${TEXT}">${o.cuerpo}</div>
          ${btn}
        </td></tr>

        <!-- Pie -->
        <tr><td style="background:#faf9f7;border-top:1px solid #efede9;padding:20px 34px">
          <div style="font-size:12px;line-height:1.6;color:${MUTED}">
            <strong style="color:#6b7280">Academia AA | DOM</strong> · Plataforma de formación de Ambiente Azul + DOM Design.<br>
            Este es un correo automático enviado desde <span style="color:#6b7280">no-reply@ambienteazul.com.co</span>; por favor no respondas a este mensaje.
          </div>
        </td></tr>

      </table>
      <div style="color:#b9b6b0;font-size:11px;margin-top:14px">© Ambiente Azul · DOM Design</div>
    </td></tr>
  </table>
</body></html>`;
}

// Caja de dato resaltada (para credenciales, etc.)
function infoBox(rows: { label: string; value: string }[]): string {
  const trs = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:4px 14px 4px 0;color:${MUTED};font-size:13px;white-space:nowrap">${r.label}</td>
          <td style="padding:4px 0;font-weight:bold;color:${DARK};font-size:14px">${r.value}</td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 8px;background:${AZUL_TINT};border:1px solid #dce9f5;border-radius:12px;padding:6px 16px">
            <tr><td><table role="presentation" cellpadding="0" cellspacing="0">${trs}</table></td></tr>
          </table>`;
}

// 1) Bienvenida con acceso
export async function enviarBienvenida(p: {
  to: string;
  nombre: string;
  email: string;
  password: string;
}) {
  const html = shell({
    preheader: "Ya tienes acceso a la Academia AA | DOM. Estos son tus datos de ingreso.",
    eyebrow: "Bienvenida",
    color: AZUL,
    tint: AZUL_TINT,
    titulo: `¡Hola, ${p.nombre}! Te damos la bienvenida 👋`,
    cuerpo: `
      <p style="margin:0 0 14px">Ya tienes acceso a la <strong>Academia AA | DOM</strong>, nuestra plataforma de formación. Aquí encontrarás tus cursos, podrás presentar exámenes y descargar tus certificados.</p>
      <p style="margin:0 0 6px">Tus datos de ingreso:</p>
      ${infoBox([
        { label: "Correo", value: p.email },
        { label: "Contraseña", value: p.password },
      ])}
      <p style="margin:14px 0 0;color:${MUTED};font-size:13px">Tip: al ingresar, marca <strong style="color:${TEXT}">“Recuérdame”</strong> para no tener que escribir tu clave cada vez.</p>`,
    ctaTexto: "Ingresar a la Academia",
    ctaUrl: `${appUrl()}/login`,
  });
  await sendMail({ to: p.to, subject: "Tu acceso a la Academia AA | DOM", html });
}

// 2) Curso asignado
export async function enviarCursoAsignado(p: {
  to: string | string[];
  cursoTitle: string;
}) {
  const html = shell({
    preheader: `Tienes un curso nuevo disponible: ${p.cursoTitle}.`,
    eyebrow: "Nuevo curso",
    color: AZUL,
    tint: AZUL_TINT,
    titulo: "Tienes un curso nuevo 📘",
    cuerpo: `
      <p style="margin:0 0 14px">Se te asignó el curso <strong style="color:${DARK}">${p.cursoTitle}</strong> en la Academia.</p>
      <p style="margin:0">Ya está disponible para que lo tomes cuando quieras. ¡Anímate a empezar!</p>`,
    ctaTexto: "Ver mis cursos",
    ctaUrl: `${appUrl()}/cursos`,
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
  const html = shell({
    preheader: `Completaste ${p.cursoTitle}. Tu certificado está listo.`,
    eyebrow: "¡Felicitaciones!",
    color: ORO,
    tint: ORO_TINT,
    titulo: `¡Lo lograste, ${p.nombre}! 🎉`,
    cuerpo: `
      <p style="margin:0 0 14px">Completaste el curso <strong style="color:${DARK}">${p.cursoTitle}</strong>. Tu esfuerzo valió la pena. 🏆</p>
      <p style="margin:0">Tu certificado ya está listo para descargar.</p>`,
    ctaTexto: "Descargar mi certificado",
    ctaUrl: `${appUrl()}/api/certificados/${p.certId}`,
  });
  await sendMail({ to: p.to, subject: `Tu certificado: ${p.cursoTitle}`, html });
}

// 4) Recordatorio de vencimientos (digest por persona)
export async function enviarRecordatorio(p: {
  to: string;
  nombre: string;
  cursos: { title: string; fecha: string; vencido: boolean }[];
}) {
  const filas = p.cursos
    .map(
      (c, i) =>
        `<tr>
          <td style="padding:11px 12px 11px 14px;border-top:${i === 0 ? "0" : "1px solid #f0eee9"};font-size:14px;color:${DARK}">${c.title}</td>
          <td style="padding:11px 14px 11px 12px;border-top:${i === 0 ? "0" : "1px solid #f0eee9"};text-align:right;white-space:nowrap">
            <span style="display:inline-block;background:${c.vencido ? "#fbeaea" : ORO_TINT};color:${c.vencido ? "#c0392b" : ORO};font-size:12px;font-weight:bold;padding:4px 10px;border-radius:999px">${c.vencido ? "Vencido" : "Vence"} · ${c.fecha}</span>
          </td>
        </tr>`,
    )
    .join("");
  const html = shell({
    preheader: "Tienes cursos pendientes con fecha límite cercana.",
    eyebrow: "Recordatorio",
    color: "#c0392b",
    tint: "#fbeaea",
    titulo: `Hola, ${p.nombre} ⏰`,
    cuerpo: `
      <p style="margin:0 0 16px">Tienes cursos pendientes con fecha límite <strong>cercana o vencida</strong>. Ponte al día para no quedarte atrás:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #f0eee9;border-radius:12px;overflow:hidden">${filas}</table>`,
    ctaTexto: "Ir a mis cursos",
    ctaUrl: `${appUrl()}/cursos`,
  });
  await sendMail({
    to: p.to,
    subject: "Recordatorio: tienes cursos pendientes",
    html,
  });
}
