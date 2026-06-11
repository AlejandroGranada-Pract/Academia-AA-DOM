"use client";

import { useTransition } from "react";
import { toggleUserActive } from "@/lib/actions/usuarios";

export function ToggleActivo({
  userId,
  active,
}: {
  userId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void toggleUserActive(userId, !active);
        })
      }
      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 ${
        active
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground"
      }`}
      title={active ? "Clic para desactivar" : "Clic para activar"}
    >
      {active ? "Activo" : "Inactivo"}
    </button>
  );
}
