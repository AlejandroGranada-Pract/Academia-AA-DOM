"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  iniciarExamen,
  submitExam,
  type ExamResult,
  type RespuestaUsuario,
} from "@/lib/actions/examen";
import { PreguntaCard, type PreguntaLite } from "@/components/examen/PreguntaCard";
import { ResultadoExamen } from "@/components/examen/ResultadoExamen";
import { Button, buttonVariants } from "@/components/ui/button";
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
      {/* Aviso: salirse cuenta como intento */}
      <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-xs text-foreground/80">
        Este intento ya quedó registrado. Si sales sin enviarlo, se contará como
        un intento usado.
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
    </div>
  );
}
