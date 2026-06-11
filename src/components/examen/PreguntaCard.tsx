"use client";

import { Check } from "lucide-react";
import type { RespuestaUsuario } from "@/lib/actions/examen";

export type PreguntaLite = {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "MULTI_SELECT" | "TRUE_FALSE" | "FILL_BLANK";
  options: string[];
};

export function PreguntaCard({
  index,
  total,
  pregunta,
  value,
  onChange,
}: {
  index: number;
  total: number;
  pregunta: PreguntaLite;
  value: RespuestaUsuario;
  onChange: (v: RespuestaUsuario) => void;
}) {
  const isMulti = pregunta.type === "MULTI_SELECT";

  const isSelected = (i: number) =>
    isMulti ? Array.isArray(value) && value.includes(i) : value === i;

  function toggle(i: number) {
    if (isMulti) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]);
    } else {
      onChange(i);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
        Pregunta {index + 1} de {total}
        {isMulti && " · selección múltiple"}
      </p>
      <p className="mb-4 text-base font-medium text-foreground">
        {pregunta.question}
      </p>

      <ul className="space-y-2">
        {pregunta.options.map((opt, i) => {
          const selected = isSelected(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/8"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${
                    isMulti ? "rounded-md" : "rounded-full"
                  } ${selected ? "border-primary bg-primary text-white" : "border-border"}`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
