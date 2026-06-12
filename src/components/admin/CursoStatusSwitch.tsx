"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setCourseStatus } from "@/lib/actions/cursos";
import { Switch } from "@/components/ui/switch";

export function CursoStatusSwitch({
  courseId,
  status,
}: {
  courseId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const active = status === "PUBLISHED";

  return (
    <span className="flex items-center gap-1.5">
      <Switch
        checked={active}
        disabled={pending}
        onCheckedChange={(v) =>
          startTransition(async () => {
            await setCourseStatus(courseId, v ? "PUBLISHED" : "DRAFT");
            toast.success(v ? "Curso activado" : "Curso desactivado");
          })
        }
        title={
          active
            ? "Desactivar (los empleados dejan de verlo)"
            : "Activar (visible para los empleados)"
        }
      />
      <span
        className={`text-xs font-semibold ${
          active ? "text-success" : "text-muted-foreground"
        }`}
      >
        {active ? "Activo" : "Inactivo"}
      </span>
    </span>
  );
}
