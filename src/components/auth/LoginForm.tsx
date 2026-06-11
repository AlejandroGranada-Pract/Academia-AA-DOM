"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Botón separado para poder usar useFormStatus (debe ir dentro del <form>).
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </Button>
  );
}

export function LoginForm() {
  const [errorMessage, formAction] = useFormState(authenticate, undefined);

  const inputClass =
    "border-white/25 bg-white/10 text-white placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-primary/40";

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@ambienteazul.com.co"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
