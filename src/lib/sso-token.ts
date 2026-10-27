import { jwtVerify } from "jose";

export type SsoPayload = { email: string; nombre: string; jti: string };

// Vida máxima aceptada de un token. Debe ser <= a la retención de jti usados
// (src/lib/sso.ts, 1 hora): si un token viviera más que esa retención, tras la
// limpieza se podría volver a canjear.
export const SSO_MAX_VIDA_SEG = 60 * 60;

// Verifica el token de paso emitido por la intranet: firma HS256 con el
// SSO_SECRET compartido, audiencia "academia" y expiración OBLIGATORIA (jose
// valida exp; aquí además se exige que exista y no exceda SSO_MAX_VIDA_SEG).
// Devuelve null ante cualquier problema — el caller decide el mensaje.
export async function verificarTokenSso(token: string): Promise<SsoPayload | null> {
  const secreto = process.env.SSO_SECRET;
  if (!secreto) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secreto), {
      audience: "academia",
      algorithms: ["HS256"],
      requiredClaims: ["exp"],
    });

    const ahora = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp - ahora > SSO_MAX_VIDA_SEG) {
      return null;
    }
    if (typeof payload.email !== "string" || typeof payload.jti !== "string") {
      return null;
    }

    const nombre =
      typeof payload.nombre === "string" && payload.nombre.trim()
        ? payload.nombre.trim().slice(0, 120)
        : payload.email;
    return {
      email: payload.email.trim().toLowerCase(),
      nombre,
      jti: payload.jti,
    };
  } catch {
    return null;
  }
}
