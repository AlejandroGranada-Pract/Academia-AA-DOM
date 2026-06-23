"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// Acción de servidor que dispara el login con credenciales.
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      // checkbox "Recuérdame": "on" si está marcado → lo normalizamos a "true".
      remember: formData.get("remember") ? "true" : "",
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Correo o contraseña incorrectos.";
    }
    // signIn lanza un redirect interno que NO debemos atrapar: se relanza.
    throw error;
  }
}
