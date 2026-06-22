"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  abandonarExamen,
  iniciarExamen,
  registrarSalidaPestana,
  submitExam,
  type ExamResult,
  type RespuestaUsuario,
} from "@/lib/actions/examen";
import { PreguntaCard, type PreguntaLite } from "@/components/examen/PreguntaCard";
import { ResultadoExamen } from "@/components/examen/ResultadoExamen";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Sesion = {
  attemptId: string;
  intento: number;
  maxAttempts: number;
  deadline: number | null; // ms epoch, o null si no hay tiempo límite
};

export function ExamenTomar({
  exam,
  preguntas,
  best,
  courseHref,
}: {
  exam: {
    id: string;
    title: string;
    passingScore: number;
    timeLimitMin: number | null;
    maxAttempts: number;
  };
  preguntas: PreguntaLite[];
  best: number;
  courseHref: string;
}) {
  const [phase, setPhase] = useState<"loading" | "taking" | "noAttempts">(
    "loading",
  );
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [answers, setAnswers] = useState<Record<string, RespuestaUsuario>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const submittedRef = useRef(false);
  const startedRef = useRef(false);

  // Al montar: registra/reanuda el intento (el intento se cuenta al abrir).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      const res = await iniciarExamen(exam.id);
      if (!res.ok) {
        setPhase("noAttempts");
        return;
      }
      const deadline = res.timeLimitMin
        ? res.startedAt + res.timeLimitMin * 60_000
        : null;
      setSesion({
        attemptId: res.attemptId,
        intento: res.intento,
        maxAttempts: res.maxAttempts,
        deadline,
      });
      setTimeLeft(
        deadline ? Math.max(0, Math.round((deadline - Date.now()) / 1000)) : null,
      );
      setPhase("taking");
    })();
  }, [exam.id]);

  const answeredCount = preguntas.filter((q) => {
    const a = answers[q.id];
    return Array.isArray(a) ? a.length > 0 : a != null;
  }).length;

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !sesion) return;
    submittedRef.current = true;
    setSubmitting(true);
    const res = await submitExam(sesion.attemptId, answers);
    if (res.ok) {
      setResult(res);
      for (const titulo of res.nuevasInsignias ?? []) {
        toast.success("¡Insignia desbloqueada! 🏅", { description: titulo });
      }
    } else {
      setError(res.error);
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [sesion, answers]);

  // Temporizador anclado al inicio real (salir y volver no resetea el tiempo).
  useEffect(() => {
    if (phase !== "taking" || timeLeft == null || result) return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const d = sesion?.deadline;
    const t = setInterval(() => {
      setTimeLeft(d ? Math.max(0, Math.round((d - Date.now()) / 1000)) : null);
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, result, handleSubmit, sesion]);

  // ---- Guard de salida: salir del examen cuenta como intento ----
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  // Activo solo mientras se está respondiendo (no en resultado ni al enviar).
  const activeRef = useRef(false);
  activeRef.current = phase === "taking" && !result && !submittedRef.current;
  const attemptIdRef = useRef<string | null>(null);
  attemptIdRef.current = sesion?.attemptId ?? null;

  // Integridad: detecta cuando el alumno sale de la pestaña (cambia de pestaña,
  // minimiza o cambia de app). Lo registra y se lo advierte al volver.
  useEffect(() => {
    function onVisibility() {
      if (!activeRef.current) return;
      if (document.visibilityState === "hidden") {
        const id = attemptIdRef.current;
        if (id) void registrarSalidaPestana(id);
        setTabSwitches((n) => n + 1);
      } else {
        toast.warning("Saliste de la pestaña", {
          description: "Esto queda registrado en el examen.",
        });
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Aviso nativo al cerrar/recargar la pestaña.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!activeRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Intercepta navegación interna (sidebar, breadcrumb…) para confirmar.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!activeRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL((a as HTMLAnchorElement).href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  async function confirmarSalida() {
    const href = pendingHref;
    setLeaving(true);
    if (sesion) await abandonarExamen(sesion.attemptId);
    setPendingHref(null);
    if (href) router.push(href);
  }

  if (result?.ok) {
    return (
      <ResultadoExamen
        score={result.score}
        passed={result.passed}
        passingScore={result.passingScore}
        results={result.results}
        courseHref={courseHref}
      />
    );
  }

  if (phase === "loading") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border bg-card p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparando el examen…
      </div>
    );
  }

  if (phase === "noAttempts") {
    return (
      <div className="mt-4 rounded-2xl border bg-card p-8 text-center">
        <p className="font-heading text-5xl text-foreground">{best}%</p>
        <p className="mt-2 font-medium text-foreground">
          {best >= exam.passingScore
            ? "Examen aprobado"
            : "Sin intentos disponibles"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Usaste tus {exam.maxAttempts} intentos. Tu mejor puntaje fue {best}%.
        </p>
        <Link
          href={courseHref}
          className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
        >
          Volver al curso
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Aviso: salirse cuenta como intento + integridad */}
      <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs text-foreground/80">
        Este intento ya quedó registrado. Si sales sin enviarlo, se contará como
        un intento usado. No salgas de esta pestaña durante el examen: las
        salidas quedan registradas.
        {tabSwitches > 0 && (
          <span className="mt-1 block font-semibold text-destructive">
            Has salido de la pestaña {tabSwitches}{" "}
            {tabSwitches === 1 ? "vez" : "veces"}.
          </span>
        )}
      </div>

      {/* Barra superior: progreso + temporizador */}
      <div className="flex items-center justify-between rounded-2xl border bg-card px-5 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {answeredCount} de {preguntas.length} respondidas
          </p>
          <p className="text-xs text-muted-foreground">
            Intento {sesion?.intento} de {exam.maxAttempts} · aprueba con{" "}
            {exam.passingScore}%
          </p>
        </div>
        {timeLeft != null && (
          <div
            className={`flex items-center gap-2 font-heading text-2xl ${
              timeLeft <= 30 ? "text-destructive" : "text-foreground"
            }`}
          >
            <Clock className="h-5 w-5" />
            {mmss(timeLeft)}
          </div>
        )}
      </div>

      {preguntas.map((q, i) => (
        <PreguntaCard
          key={q.id}
          index={i}
          total={preguntas.length}
          pregunta={q}
          value={answers[q.id] ?? null}
          onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
        />
      ))}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        onClick={() => {
          if (
            answeredCount < preguntas.length &&
            !window.confirm(
              "Hay preguntas sin responder. ¿Enviar de todos modos?",
            )
          ) {
            return;
          }
          void handleSubmit();
        }}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Enviando..." : "Enviar examen"}
      </Button>

      {/* Confirmación al intentar salir del examen */}
      <Dialog
        open={pendingHref !== null}
        onOpenChange={(o) => !o && !leaving && setPendingHref(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center">¿Salir del examen?</DialogTitle>
            <DialogDescription className="text-center">
              Si sales ahora, este intento se contará como usado y no podrás
              retomarlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setPendingHref(null)}
              disabled={leaving}
            >
              Seguir en el examen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarSalida}
              disabled={leaving}
            >
              {leaving ? "Saliendo..." : "Salir (cuenta como intento)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
