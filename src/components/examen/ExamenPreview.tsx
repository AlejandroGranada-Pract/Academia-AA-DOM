import { Check } from "lucide-react";

type PreguntaPreview = {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string | null;
};

// Vista de solo lectura del examen para la previsualización del admin
// ("Ver como empleado"). Muestra cada pregunta con su(s) respuesta(s)
// correcta(s) marcada(s). No permite responder ni crea intentos.
export function ExamenPreview({
  questions,
  passingScore,
}: {
  questions: PreguntaPreview[];
  passingScore: number;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {questions.length} preguntas · puntaje mínimo {passingScore}%
      </p>

      {questions.map((q, i) => {
        const correct = new Set(
          Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer],
        );
        return (
          <div key={q.id} className="rounded-2xl border bg-card p-5">
            <p className="font-medium text-foreground">
              {i + 1}. {q.question}
            </p>
            <ul className="mt-3 space-y-2">
              {q.options.map((opt, idx) => {
                const isCorrect = correct.has(idx);
                return (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      isCorrect
                        ? "border-success/40 bg-success/10 font-medium text-success"
                        : "border-border text-foreground"
                    }`}
                  >
                    {isCorrect ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                    {opt}
                  </li>
                );
              })}
            </ul>
            {q.explanation && (
              <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold">Explicación: </span>
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
