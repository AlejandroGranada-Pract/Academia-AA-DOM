// Límite de intentos de login por correo (en memoria del proceso). Frena la
// adivinación de contraseñas y evita que intentos masivos consuman CPU con
// bcrypt: si el correo está bloqueado, se rechaza antes de comparar el hash.
// Con un solo dyno es suficiente; con varios, cada uno lleva su propio conteo.

const MAX_FALLOS = 10;
const VENTANA_MS = 15 * 60 * 1000;
const MAX_CLAVES = 10_000; // tope de memoria

type Registro = { fallos: number; desde: number };
const registros = new Map<string, Registro>();

function vigente(clave: string, ahora: number): Registro | undefined {
  const r = registros.get(clave);
  if (r && ahora - r.desde > VENTANA_MS) {
    registros.delete(clave);
    return undefined;
  }
  return r;
}

export function loginBloqueado(email: string): boolean {
  const r = vigente(email, Date.now());
  return !!r && r.fallos >= MAX_FALLOS;
}

export function registrarFalloLogin(email: string): void {
  const ahora = Date.now();
  const r = vigente(email, ahora);
  if (r) {
    r.fallos += 1;
    return;
  }
  if (registros.size >= MAX_CLAVES) {
    // Descarta el registro más antiguo (orden de inserción del Map).
    const primero = registros.keys().next().value;
    if (primero !== undefined) registros.delete(primero);
  }
  registros.set(email, { fallos: 1, desde: ahora });
}

export function limpiarFallosLogin(email: string): void {
  registros.delete(email);
}
