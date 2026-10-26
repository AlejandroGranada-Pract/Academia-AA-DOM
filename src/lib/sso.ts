import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

// Registra el jti como usado. Devuelve false si ya existía (replay).
export async function consumirJti(jti: string): Promise<boolean> {
  try {
    await prisma.ssoJti.create({ data: { jti } });
  } catch {
    return false; // violación de unique = token ya canjeado
  }

  // Limpieza oportunista: los tokens viven 60s, así que cualquier fila de
  // más de 1 hora ya no puede corresponder a un token vigente.
  const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.ssoJti.deleteMany({ where: { usadoEn: { lt: haceUnaHora } } }).catch(() => {});

  return true;
}

// Busca el usuario por email; si no existe lo crea con rol EMPLOYEE y
// empresa AMBAS (política aprobada en la spec: todo el que está en la
// intranet puede entrar a la Academia). La contraseña es aleatoria: si
// algún día quiere entrar directo, usa "recuperar contraseña".
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
