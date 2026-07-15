import { jwtVerify } from "jose";

export type SsoPayload = { email: string; nombre: string; jti: string };

// Verifica el token de paso emitido por la intranet: firma HS256 con el
// SSO_SECRET compartido, audiencia "academia" y expiración (jose valida exp).
// Devuelve null ante cualquier problema — el caller decide el mensaje.
export async function verificarTokenSso(token: string): Promise<SsoPayload | null> {
  const secreto = process.env.SSO_SECRET;
  if (!secreto) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secreto), {
      audience: "academia",
      algorithms: ["HS256"],
    });

    if (typeof payload.email !== "string" || typeof payload.jti !== "string") {
      return null;
    }

    return {
      email: payload.email.trim().toLowerCase(),
      nombre: typeof payload.nombre === "string" ? payload.nombre : payload.email,
      jti: payload.jti,
    };
  } catch {
    return null;
  }
}
