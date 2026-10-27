// Política de URLs para contenido creado por el staff (bloques de lecciones,
// borradores de la IA). Solo se aceptan http(s) absolutas o rutas relativas del
// mismo sitio (p. ej. /api/imagenes/...). Cualquier otro esquema (javascript:,
// data:, vbscript:...) se rechaza: en un <iframe src> o <a href> ejecutaría
// código con la sesión de quien abre la lección. Sin dependencias: se usa tanto
// en el servidor (al guardar) como en el cliente (al renderizar).

export function isSafeUrl(raw: string | null | undefined): boolean {
  return safeHref(raw) !== null;
}

// Devuelve la URL lista para usar en src/href, o null si no es segura.
// "www.ejemplo.com" se completa con https:// (como hacía el bloque de enlace).
export function safeHref(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  // Ruta relativa del mismo sitio (no "//host" ni "/\host", que salen del sitio).
  if (s.startsWith("/")) {
    return s.startsWith("//") || s.startsWith("/\\") ? null : s;
  }
  const candidato = /^www\./i.test(s) ? `https://${s}` : s;
  try {
    const u = new URL(candidato);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return candidato;
  } catch {
    return null;
  }
}

// ¿La URL es https y su host está en la lista (o es subdominio de uno)?
export function isHttpsHost(raw: string | null | undefined, hosts: string[]): boolean {
  try {
    const u = new URL((raw ?? "").trim());
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return hosts.some((d) => h === d || h.endsWith(`.${d}`));
  } catch {
    return false;
  }
}
