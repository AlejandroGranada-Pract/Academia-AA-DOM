"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toggleCourseInGrupo, toggleUserInGrupo } from "@/lib/actions/grupos";

// Fila con checkbox para incluir/excluir un curso o usuario de un grupo.
export function MembershipToggle({
  grupoId,
  itemId,
  kind,
  member,
  title,
  subtitle,
}: {
  grupoId: string;
  itemId: string;
  kind: "course" | "user";
  member: boolean;
  title: string;
  subtitle?: string;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !member;
    startTransition(() => {
      if (kind === "course") {
        void toggleCourseInGrupo(grupoId, itemId, next);
      } else {
        void toggleUserInGrupo(grupoId, itemId, next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
        member
          ? "border-primary bg-primary/8"
          : "border-border hover:border-primary/50 hover:bg-muted/40"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          member ? "border-primary bg-primary text-white" : "border-border"
        }`}
      >
        {member && <Check className="h-3 w-3" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}
