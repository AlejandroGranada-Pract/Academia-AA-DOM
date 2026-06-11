"use server";

import { signOut } from "@/auth";

// Server action para cerrar sesión. Se puede usar como <form action={signOutAction}>
// incluso desde componentes cliente (Next.js lo permite).
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
