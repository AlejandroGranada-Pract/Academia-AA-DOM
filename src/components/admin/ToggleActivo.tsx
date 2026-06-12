"use client";

import { useTransition } from "react";
import { toggleUserActive } from "@/lib/actions/usuarios";
import { Switch } from "@/components/ui/switch";

export function ToggleActivo({
  userId,
  active,
}: {
  userId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <span className="flex items-center gap-1.5">
      <Switch
        checked={active}
        disabled={pending}
        onCheckedChange={(v) =>
          startTransition(() => {
            void toggleUserActive(userId, v);
          })
        }
        title={active ? "Desactivar usuario" : "Activar usuario"}
      />
      <span
        className={`text-[11px] font-semibold ${
          active ? "text-success" : "text-muted-foreground"
        }`}
      >
        {active ? "Activo" : "Inactivo"}
      </span>
    </span>
  );
}
