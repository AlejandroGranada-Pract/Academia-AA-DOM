"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { submitExam, type ExamResult, type RespuestaUsuario } from "@/lib/actions/examen";
import { PreguntaCard, type PreguntaLite } from "@/components/examen/PreguntaCard";
import { ResultadoExamen } from "@/components/examen/ResultadoExamen";
import { Button } from "@/components/ui/button";

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamenTomar({
  exam,
  preguntas,
  attemptsUsed,
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
  attemptsUsed: number;
  courseHref: string;
}) {
  const [answers, setAnswers] = useState<Record<string, RespuestaUsuario>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    exam.timeLimitMin ? exam.timeLimitMin * 60 : null,
  );
  const submittedRef = useRef(false);

  const answeredCount = preguntas.filter((q) => {
    const a = answers[q.id];
    return Array.isArray(a) ? a.length > 0 : a != null;
  }).length;

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const res = await submitExam(exam.id, answers);
    if (res.ok) {
      setResult(res);
    } else {
      setError(res.error);
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [exam.id, answers]);

  // Temporizador opcional: auto-envía al llegar a 0.
  useEffect(() => {
    if (timeLeft == null || result) return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((v) => (v == null ? v : v - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft, result, handleSubmit]);

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

  return (
    <div className="space-y-5">
      {/* Barra superior: progreso + temporizador */}
      <div className="flex items-center justify-between rounded-2xl border bg-card px-5 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {answeredCount} de {preguntas.length} respondidas
          </p>
          <p className="text-xs text-muted-foreground">
            Intento {attemptsUsed + 1} de {exam.maxAttempts} · aprueba con{" "}
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
