import Link from "next/link";
import { CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import type { ResultadoPregunta } from "@/lib/actions/examen";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ResultadoExamen({
  score,
  passed,
  passingScore,
  results,
  courseHref,
}: {
  score: number;
  passed: boolean;
  passingScore: number;
  results: ResultadoPregunta[];
  courseHref: string;
}) {
  return (
    <div className="space-y-6">
      {/* Resumen del puntaje */}
      <div
        className={`rounded-2xl border p-8 text-center ${
          passed
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        }`}
      >
        <p className="font-heading text-6xl text-foreground">{score}%</p>
        <p
          className={`mt-2 text-lg font-semibold ${
            passed ? "text-success" : "text-destructive"
          }`}
        >
          {passed ? "¡Aprobado!" : "No aprobado"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Puntaje mínimo para aprobar: {passingScore}%
        </p>
      </div>

      {/* Revisión pregunta por pregunta */}
      <div className="space-y-4">
        <h2 className="text-2xl text-foreground">Revisión</h2>
        {results.map((r, i) => (
          <div key={r.questionId} className="rounded-2xl border bg-card p-6">
            <div className="mb-3 flex items-start gap-2">
              {r.isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : r.earned > 0 ? (
                <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              )}
              <p className="flex-1 font-medium text-foreground">
                {i + 1}. {r.question}
              </p>
              <span
                className={`shrink-0 text-xs font-semibold ${
                  r.isCorrect
                    ? "text-success"
                    : r.earned > 0
                      ? "text-gold"
                      : "text-destructive"
                }`}
              >
                {r.earned}/{r.points} pts
              </span>
            </div>

            <ul className="ml-7 space-y-1.5 text-sm">
              {r.options.map((opt, idx) => {
                const correct = Array.isArray(r.correctAnswer)
                  ? r.correctAnswer.includes(idx)
                  : r.correctAnswer === idx;
                const chosen = Array.isArray(r.userAnswer)
                  ? r.userAnswer.includes(idx)
                  : r.userAnswer === idx;
                return (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                      correct
                        ? "bg-success/10 text-success"
                        : chosen
                          ? "bg-destructive/10 text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {opt}
                    {correct && (
                      <span className="text-xs font-semibold">(correcta)</span>
                    )}
                    {chosen && !correct && (
                      <span className="text-xs font-semibold">(tu respuesta)</span>
                    )}
                  </li>
                );
              })}
            </ul>

            {r.explanation && (
              <p className="ml-7 mt-3 rounded-lg border-l-4 border-primary bg-primary/8 p-3 text-sm text-foreground">
                {r.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <Link href={courseHref} className={cn(buttonVariants(), "w-full")}>
        Volver al curso
      </Link>
    </div>
  );
}
