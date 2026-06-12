"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  createCourseFromDraft,
  type DraftCourse,
} from "@/lib/actions/asistente";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring";
const areaClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring";

// Extrae el JSON del texto generado (tolera texto/cercas alrededor).
function parseDraft(text: string): DraftCourse | null {
  const t = text.trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first === -1 || last <= first) return null;
  try {
    return JSON.parse(t.slice(first, last + 1)) as DraftCourse;
  } catch {
    return null;
  }
}

type Step = "form" | "generating" | "preview";

export function AsistenteFlotante() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [objetivo, setObjetivo] = useState("");
  const [empresa, setEmpresa] = useState("AMBAS");
  const [categoria, setCategoria] = useState("FORMACION_CONTINUA");
  const [material, setMaterial] = useState("");
  const [streamText, setStreamText] = useState("");
  const [draft, setDraft] = useState<DraftCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Auto-scroll del texto en vivo.
  useEffect(() => {
    preRef.current?.scrollTo({ top: preRef.current.scrollHeight });
  }, [streamText]);

  async function generar() {
    if (!objetivo.trim()) {
      setError("Describe el objetivo del curso.");
      return;
    }
    setError(null);
    setStreamText("");
    setDraft(null);
    setStep("generating");

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objetivo, material, empresa, categoria }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        setError(await res.text().catch(() => "Error generando el curso."));
        setStep("form");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamText(full);
      }

      const parsed = parseDraft(full);
      if (!parsed) {
        setError(
          "No pude interpretar la respuesta de la IA. Intenta generar de nuevo.",
        );
        setStep("form");
        return;
      }
      setDraft(parsed);
      setStep("preview");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Error de conexión generando el curso.");
      }
      setStep("form");
    } finally {
      abortRef.current = null;
    }
  }

  function cancelar() {
    abortRef.current?.abort();
    setStep("form");
  }

  function crearBorrador() {
    if (!draft) return;
    startTransition(async () => {
      const res = await createCourseFromDraft(draft, { categoria, empresa });
      if (res.error) {
        setError(res.error);
        return;
      }
      toast.success("Curso creado como borrador — revísalo y actívalo");
      setOpen(false);
      // Reset para la próxima vez
      setStep("form");
      setObjetivo("");
      setMaterial("");
      setStreamText("");
      setDraft(null);
      if (res.id) router.push(`/admin/cursos/${res.id}/edit`);
    });
  }

  const totalLecciones =
    draft?.modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0) ?? 0;
  const totalPreguntas =
    draft?.modules.reduce(
      (n, m) => n + (m.exam?.questions?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <>
      {/* Botón flotante (solo se monta para SUPER_ADMIN, ver AppShell) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Asistente IA — genera un curso"
        aria-label="Abrir Asistente IA"
        className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light text-white shadow-[0_8px_30px_rgba(190,155,96,0.5)] transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={(o) => !creating && setOpen(o)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              Asistente IA
            </DialogTitle>
            <DialogDescription>
              Describe el curso (y pega material si tienes). La IA genera un
              borrador que tú revisas — nunca se publica solo.
            </DialogDescription>
          </DialogHeader>

          {step === "form" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="objetivo">¿Qué curso necesitas?</Label>
                <textarea
                  id="objetivo"
                  rows={3}
                  className={areaClass}
                  placeholder='Ej.: "Curso de atención al cliente para asesores de showroom, con protocolo de visita y manejo de objeciones"'
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="aempresa">Empresa</Label>
                  <select
                    id="aempresa"
                    className={selectClass}
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  >
                    <option value="AMBAS">Ambas</option>
                    <option value="AMBIENTE_AZUL">Ambiente Azul</option>
                    <option value="DOM_DESIGN">DOM Design</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acategoria">Categoría</Label>
                  <select
                    id="acategoria"
                    className={selectClass}
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="FORMACION_CONTINUA">Formación continua</option>
                    <option value="INDUCCION">Inducción</option>
                    <option value="CAPACITACION_AREA">Capacitación de área</option>
                    <option value="TECNICO">Técnico</option>
                    <option value="PRODUCTO">Producto</option>
                    <option value="PROCESO">Proceso</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="material">
                  Material de referencia (opcional)
                </Label>
                <textarea
                  id="material"
                  rows={6}
                  className={areaClass}
                  placeholder="Pega aquí el texto fuente: apuntes, manual, contenido de una presentación…"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {material.length.toLocaleString()} caracteres (máx. 60.000)
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button onClick={generar} className="w-full gap-1.5">
                <Sparkles className="h-4 w-4" />
                Generar borrador
              </Button>
            </div>
          )}

          {step === "generating" && (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                Generando el curso con IA… busca videos e imágenes reales en la
                web, puede tomar 1–2 minutos.
              </p>
              <pre
                ref={preRef}
                className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground"
              >
                {streamText || "…"}
              </pre>
              <Button variant="outline" onClick={cancelar} className="w-full">
                Cancelar
              </Button>
            </div>
          )}

          {step === "preview" && draft && (
            <div className="space-y-3">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                  Borrador generado
                </p>
                <h3 className="mt-1 font-semibold text-foreground">
                  {draft.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {draft.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {draft.modules.length} módulos · {totalLecciones} lecciones ·{" "}
                  {totalPreguntas} preguntas de examen
                </p>
              </div>

              <div className="max-h-56 space-y-2 overflow-y-auto">
                {draft.modules.map((m, i) => (
                  <div key={i} className="rounded-lg border bg-card px-3 py-2 text-sm">
                    <p className="font-medium text-foreground">
                      {i + 1}. {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(m.lessons ?? []).map((l) => l.title).join(" · ")}
                      {m.exam ? ` · 📝 ${m.exam.title}` : ""}
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => setStep("form")}
                  disabled={creating}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Ajustar y regenerar
                </Button>
                <Button
                  className="flex-1"
                  onClick={crearBorrador}
                  disabled={creating}
                >
                  {creating ? "Creando..." : "Crear curso (borrador)"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
