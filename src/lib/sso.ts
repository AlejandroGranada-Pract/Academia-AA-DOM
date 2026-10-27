import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { SSO_MAX_VIDA_SEG } from "./sso-token";

// Registra el jti como usado. Devuelve false si ya existía (replay).
export async function consumirJti(jti: string): Promise<boolean> {
  try {
    await prisma.ssoJti.create({ data: { jti } });
  } catch {
    return false; // violación de unique = token ya canjeado
  }

  // Limpieza oportunista: verificarTokenSso rechaza tokens que vivan más de
  // SSO_MAX_VIDA_SEG (1 h), así que una fila más vieja que eso ya no puede
  // corresponder a un token canjeable. Mantener ambos valores alineados.
  const haceUnaHora = new Date(Date.now() - SSO_MAX_VIDA_SEG * 1000);
  await prisma.ssoJti.deleteMany({ where: { usadoEn: { lt: haceUnaHora } } }).catch(() => {});

  return true;
}

// Busca el usuario por email; si no existe lo crea con rol EMPLOYEE y
// empresa AMBAS (política aprobada en la spec: todo el que está en la
// intranet puede entrar a la Academia). La contraseña es aleatoria: para
// entrar directo, un admin debe asignarle una.
export async function buscarOCrearUsuarioSso(email: string, nombre: string) {
  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) return existente;

  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
  return prisma.user.create({
    data: {
      email,
      name: nombre,
      passwordHash,
      role: "EMPLOYEE",
      company: "AMBAS",
      active: true,
    },
  });
}
