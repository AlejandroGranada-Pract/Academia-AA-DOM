import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { verificarTokenSso } from "@/lib/sso-token";
import { prisma } from "@/lib/db";

// Punto de canje del SSO desde la intranet: /api/sso?token=<jwt>
// La validación autoritativa (incluido el jti de un solo uso) vive en el
// provider "sso"; aquí solo pre-validamos para dar mensajes de error claros.
export async function GET(req: NextRequest) {
  // Detrás del proxy de Heroku, req.nextUrl.origin resuelve a localhost;
  // usar NEXTAUTH_URL como base y solo caer al origin actual si no está definida.
  const base = process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const irALogin = (codigo: string) =>
    NextResponse.redirect(new URL(`/login?error=${codigo}`, base));

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return irALogin("sso");

  const payload = await verificarTokenSso(token);
  if (!payload) return irALogin("sso");

  const existente = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existente && !existente.active) return irALogin("sso-inactivo");

  try {
    await signIn("sso", { token, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) return irALogin("sso");
    // Éxito: signIn lanza el redirect interno de Next hacia "/" — relanzar.
    throw error;
  }

  return irALogin("sso"); // inalcanzable en la práctica
}
