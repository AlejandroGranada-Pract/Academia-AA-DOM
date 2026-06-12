"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  saveExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionInput,
} from "@/lib/actions/editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring";
const areaClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring";

export type ExamenEditable = {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMin: number | null;
  questions: {
    id: string;
    question: string;
    type: "MULTIPLE_CHOICE" | "MULTI_SELECT" | "TRUE_FALSE";
    options: string[];
    correctAnswer: number | number[];
    points: number;
    explanation: string;
  }[];
};

// Diálogo completo del examen: datos + preguntas.
// examen = null → crear examen nuevo en el módulo.
export function ExamenEditorDialog({
  courseId,
  moduleId,
  examen,
  open,
  onOpenChange,
}: {
  courseId: string;
  moduleId: string;
  examen: ExamenEditable | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const isEdit = !!examen;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editingQ, setEditingQ] = useState<ExamenEditable["questions"][0] | null>(null);
  const [creatingQ, setCreatingQ] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const timeRaw = String(fd.get("timeLimitMin") ?? "").trim();
    startTransition(async () => {
      const err = await saveExam(courseId, moduleId, examen?.id ?? null, {
        title: String(fd.get("title") ?? ""),
        description: String(fd.get("description") ?? ""),
        passingScore: parseInt(String(fd.get("passingScore") ?? "70"), 10),
        maxAttempts: parseInt(String(fd.get("maxAttempts") ?? "3"), 10),
        timeLimitMin: timeRaw ? parseInt(timeRaw, 10) : null,
      });
      if (err) return setError(err);
      toast.success(isEdit ? "Examen actualizado" : "Examen creado al final del módulo");
      if (!isEdit) onOpenChange(false);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar examen" : "Nuevo examen"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Datos del examen y sus preguntas."
                : "Se agrega al final del módulo; luego puedes moverlo con las flechas."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="etitle">Título</Label>
              <Input id="etitle" name="title" defaultValue={examen?.title} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edesc">Descripción (opcional)</Label>
              <Input id="edesc" name="description" defaultValue={examen?.description} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="epass">Mín. aprobar %</Label>
                <Input
                  id="epass"
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={examen?.passingScore ?? 70}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eatt">Intentos</Label>
                <Input
                  id="eatt"
                  name="maxAttempts"
                  type="number"
                  min="1"
                  defaultValue={examen?.maxAttempts ?? 3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="etime">Tiempo (min)</Label>
                <Input
                  id="etime"
                  name="timeLimitMin"
                  type="number"
                  min="1"
                  placeholder="Sin límite"
                  defaultValue={examen?.timeLimitMin ?? ""}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? "Guardando..." : isEdit ? "Guardar datos" : "Crear examen"}
              </Button>
            </div>
          </form>

          {/* Preguntas (solo al editar) */}
          {isEdit && examen && (
            <div className="space-y-1.5 border-t pt-3">
              <Label>Preguntas ({examen.questions.length})</Label>
              {examen.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <span className="text-xs font-bold text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span className="min-w-0 flex-1 truncate">{q.question}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {q.type === "MULTIPLE_CHOICE"
                      ? "única"
                      : q.type === "MULTI_SELECT"
                        ? "múltiple"
                        : "V/F"}{" "}
                    · {q.points} pt
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingQ(q)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteQuestion(courseId, q.id);
                        toast.success("Pregunta eliminada");
                      })
                    }
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCreatingQ(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar pregunta
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isEdit && examen && (
        <PreguntaDialog
          courseId={courseId}
          examId={examen.id}
          pregunta={creatingQ ? null : editingQ}
          open={creatingQ || !!editingQ}
          onOpenChange={(o) => {
            if (!o) {
              setCreatingQ(false);
              setEditingQ(null);
            }
          }}
        />
      )}
    </>
  );
}

// ============================ Pregunta ============================

function PreguntaDialog({
  courseId,
  examId,
  pregunta,
  open,
  onOpenChange,
}: {
  courseId: string;
  examId: string;
  pregunta: ExamenEditable["questions"][0] | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const isEdit = !!pregunta;
  const [type, setType] = useState<QuestionInput["type"]>(
    pregunta?.type ?? "MULTIPLE_CHOICE",
  );
  const [question, setQuestion] = useState(pregunta?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    pregunta?.type === "TRUE_FALSE"
      ? ["Verdadero", "Falso"]
      : (pregunta?.options ?? ["", ""]),
  );
  const [correct, setCorrect] = useState<number[]>(
    pregunta
      ? Array.isArray(pregunta.correctAnswer)
        ? pregunta.correctAnswer
        : [pregunta.correctAnswer]
      : [],
  );
  const [points, setPoints] = useState(String(pregunta?.points ?? 1));
  const [explanation, setExplanation] = useState(pregunta?.explanation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const effectiveOptions = type === "TRUE_FALSE" ? ["Verdadero", "Falso"] : options;

  function toggleCorrect(i: number) {
    if (type === "MULTI_SELECT") {
      setCorrect((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
      );
    } else {
      setCorrect([i]);
    }
  }

  function save() {
    setError(null);
    const payload: QuestionInput = {
      question,
      type,
      options: effectiveOptions,
      correctAnswer: type === "MULTI_SELECT" ? correct : (correct[0] ?? -1),
      points: parseInt(points, 10) || 1,
      explanation,
    };
    startTransition(async () => {
      const err = isEdit
        ? await updateQuestion(courseId, pregunta!.id, payload)
        : await addQuestion(courseId, examId, payload);
      if (err) return setError(err);
      toast.success(isEdit ? "Pregunta actualizada" : "Pregunta agregada");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar pregunta" : "Nueva pregunta"}</DialogTitle>
          <DialogDescription>
            Marca cuál(es) opción(es) son correctas con el círculo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Enunciado</Label>
            <textarea
              rows={2}
              className={areaClass}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <select
                className={selectClass}
                value={type}
                onChange={(e) => {
                  const t = e.target.value as QuestionInput["type"];
                  setType(t);
                  setCorrect([]);
                  if (t === "TRUE_FALSE") setOptions(["Verdadero", "Falso"]);
                }}
              >
                <option value="MULTIPLE_CHOICE">Opción única</option>
                <option value="MULTI_SELECT">Selección múltiple</option>
                <option value="TRUE_FALSE">Verdadero / Falso</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Puntos</Label>
              <Input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Opciones (marca las correctas)</Label>
            <div className="space-y-2">
              {effectiveOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Marcar como correcta"
                    onClick={() => toggleCorrect(i)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      correct.includes(i)
                        ? "border-success bg-success text-white"
                        : "border-border text-transparent"
                    }`}
                  >
                    ✓
                  </button>
                  {type === "TRUE_FALSE" ? (
                    <span className="text-sm">{opt}</span>
                  ) : (
                    <>
                      <Input
                        value={opt}
                        placeholder={`Opción ${i + 1}`}
                        onChange={(e) =>
                          setOptions((prev) =>
                            prev.map((o, idx) => (idx === i ? e.target.value : o)),
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOptions((prev) => prev.filter((_, idx) => idx !== i));
                          setCorrect((prev) =>
                            prev
                              .filter((x) => x !== i)
                              .map((x) => (x > i ? x - 1 : x)),
                          );
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            {type !== "TRUE_FALSE" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOptions((prev) => [...prev, ""])}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Opción
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Explicación (se muestra al revisar)</Label>
            <textarea
              rows={2}
              className={areaClass}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={save} disabled={pending} className="flex-1">
              {pending ? "Guardando..." : "Guardar pregunta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
