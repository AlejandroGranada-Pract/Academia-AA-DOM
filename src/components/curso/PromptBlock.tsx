"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";

// Bloque "prompt": una caja lista para copiar y pegar en Claude. Pensado para
// que el asesor no tenga que escribir el prompt desde cero.
export function PromptBlock({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Si el navegador bloquea el portapapeles, el usuario puede seleccionar
      // el texto manualmente; no hacemos nada más.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gold/40 bg-gold/[0.06]">
      <div className="flex items-center gap-2 border-b border-gold/25 bg-gold/10 px-3 py-2">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-gold">
          {label?.trim() || "Prompt para copiar en Claude"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-gold/10"
          aria-label="Copiar prompt"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copiar
            </>
          )}
        </button>
      </div>
      <pre className="max-h-none overflow-x-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground/90">
        {text}
      </pre>
    </div>
  );
}
