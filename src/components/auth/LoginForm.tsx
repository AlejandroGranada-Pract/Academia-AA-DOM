"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
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
  const [verPassword, setVerPassword] = useState(false);

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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={verPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 transition-colors hover:text-white"
          >
            {verPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 accent-primary"
        />
        Recuérdame en este dispositivo
      </label>

      {errorMessage && (
        <p className="text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
