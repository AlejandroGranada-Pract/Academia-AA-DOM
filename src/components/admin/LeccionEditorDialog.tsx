"use client";

import { useRef, useState, useTransition } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Type,
  AlignLeft,
  List,
  MessageSquareWarning,
  Image as ImageIcon,
  PlayCircle,
  FileDown,
  Table as TableIcon,
  Pencil,
  Eye,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { updateLesson, type LessonBlock } from "@/lib/actions/editor";
import { uploadImage } from "@/lib/actions/imagenes";
import { useCierreGuard, ConfirmarSalir } from "@/components/admin/ConfirmarSalir";
import { LeccionViewer } from "@/components/curso/LeccionViewer";
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
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring";
const areaClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring";

const BLOCK_TYPES: {
  type: LessonBlock["type"];
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "heading", label: "Título", icon: Type },
  { type: "paragraph", label: "Párrafo", icon: AlignLeft },
  { type: "list", label: "Lista", icon: List },
  { type: "callout", label: "Nota", icon: MessageSquareWarning },
  { type: "image", label: "Imagen", icon: ImageIcon },
  { type: "video", label: "Video", icon: PlayCircle },
  { type: "pdf", label: "PDF", icon: FileDown },
  { type: "table", label: "Tabla", icon: TableIcon },
];

// La tabla se edita como texto: una fila por línea, celdas separadas por "|".
// La primera línea son los encabezados.
function tableToText(headers?: string[], rows?: string[][]): string {
  const lines = [headers ?? [], ...(rows ?? [])];
  return lines.map((cells) => cells.join(" | ")).join("\n");
}
function textToTable(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const parse = (l: string) => l.split("|").map((c) => c.trim());
  const [head, ...rest] = lines;
  return { headers: head ? parse(head) : [], rows: rest.map(parse) };
}

function emptyBlock(type: LessonBlock["type"]): LessonBlock {
  switch (type) {
    case "list":
      return { type, items: [] };
    case "callout":
      return { type, style: "info", text: "" };
    case "image":
      return { type, url: "", caption: "" };
    case "video":
      return { type, url: "" };
    case "pdf":
      return { type, url: "", title: "" };
    case "table":
      return { type, headers: [], rows: [] };
    default:
      return { type, text: "" };
  }
}

export type LeccionEditable = {
  id: string;
  title: string;
  durationMin: number | null;
  blocks: LessonBlock[];
};

export function LeccionEditorDialog({
  courseId,
  leccion,
  open,
  onOpenChange,
}: {
  courseId: string;
  leccion: LeccionEditable | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [title, setTitle] = useState(leccion?.title ?? "");
  const [duration, setDuration] = useState<string>(
    leccion?.durationMin != null ? String(leccion.durationMin) : "",
  );
  const [blocks, setBlocks] = useState<LessonBlock[]>(leccion?.blocks ?? []);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<number | null>(null);
  const guard = useCierreGuard(dirty, () => onOpenChange(false));

  function pickImage(i: number) {
    uploadTargetRef.current = i;
    fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-subir el mismo archivo
    const target = uploadTargetRef.current;
    if (!file || target == null) return;
    setUploadingIdx(target);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadImage(fd);
      if (res.error) {
        toast.error(res.error);
      } else if (res.url) {
        patch(target, { url: res.url });
        toast.success("Imagen subida");
      }
    } finally {
      setUploadingIdx(null);
    }
  }

  function patch(i: number, partial: Partial<LessonBlock>) {
    setDirty(true);
    setBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, ...partial } : b)),
    );
  }
  function move(i: number, dir: -1 | 1) {
    setDirty(true);
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(i: number) {
    setDirty(true);
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add(type: LessonBlock["type"]) {
    setDirty(true);
    setBlocks((prev) => [...prev, emptyBlock(type)]);
  }

  function save() {
    if (!leccion) return;
    setError(null);
    startTransition(async () => {
      const err = await updateLesson(courseId, leccion.id, {
        title,
        durationMin: duration.trim() ? parseInt(duration, 10) : null,
        blocks,
      });
      if (err) return setError(err);
      setDirty(false);
      toast.success("Lección guardada");
      onOpenChange(false);
    });
  }

  return (
    <>
    <Dialog open={open} onOpenChange={guard.onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar lección</DialogTitle>
          <DialogDescription>
            Arma el contenido con bloques; usa la vista previa para verlo como
            lo verá el empleado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ltitle">Título</Label>
            <Input
              id="ltitle"
              value={title}
              onChange={(e) => {
                setDirty(true);
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ldur">Duración (min)</Label>
            <Input
              id="ldur"
              type="number"
              min="0"
              value={duration}
              onChange={(e) => {
                setDirty(true);
                setDuration(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Tabs editar / vista previa */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${
              !preview ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${
              preview ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Vista previa
          </button>
        </div>

        {preview ? (
          blocks.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Sin contenido aún. Agrega bloques en la pestaña Editar.
            </p>
          ) : (
            <LeccionViewer type="MIXED" content={{ blocks }} />
          )
        ) : (
          <div className="space-y-3">
            {blocks.map((b, i) => {
              const meta = BLOCK_TYPES.find((t) => t.type === b.type);
              const Icon = meta?.icon ?? Type;
              return (
                <div key={i} className="rounded-xl border bg-card p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {meta?.label}
                    </span>
                    <span className="flex-1" />
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(i)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Campos según tipo */}
                  {b.type === "heading" && (
                    <Input
                      placeholder="Texto del título"
                      value={b.text ?? ""}
                      onChange={(e) => patch(i, { text: e.target.value })}
                    />
                  )}
                  {b.type === "paragraph" && (
                    <textarea
                      rows={3}
                      placeholder="Texto del párrafo"
                      className={areaClass}
                      value={b.text ?? ""}
                      onChange={(e) => patch(i, { text: e.target.value })}
                    />
                  )}
                  {b.type === "list" && (
                    <textarea
                      rows={4}
                      placeholder={"Un ítem por línea"}
                      className={areaClass}
                      value={(b.items ?? []).join("\n")}
                      onChange={(e) =>
                        patch(i, {
                          items: e.target.value.split("\n"),
                        })
                      }
                    />
                  )}
                  {b.type === "callout" && (
                    <div className="space-y-2">
                      <select
                        className={selectClass}
                        value={b.style ?? "info"}
                        onChange={(e) =>
                          patch(i, { style: e.target.value as LessonBlock["style"] })
                        }
                      >
                        <option value="info">Información (azul)</option>
                        <option value="tip">Tip (dorado)</option>
                        <option value="warning">Advertencia (amarillo)</option>
                      </select>
                      <textarea
                        rows={2}
                        placeholder="Texto de la nota"
                        className={areaClass}
                        value={b.text ?? ""}
                        onChange={(e) => patch(i, { text: e.target.value })}
                      />
                    </div>
                  )}
                  {b.type === "image" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="URL de la imagen (https://...) o sube un archivo"
                          value={b.url ?? ""}
                          onChange={(e) => patch(i, { url: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingIdx === i}
                          onClick={() => pickImage(i)}
                          className="shrink-0 gap-1.5"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingIdx === i ? "Subiendo..." : "Subir"}
                        </Button>
                      </div>
                      {b.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.url}
                          alt=""
                          className="max-h-32 rounded-lg border object-cover"
                        />
                      )}
                      <Input
                        placeholder="Pie de foto (opcional)"
                        value={b.caption ?? ""}
                        onChange={(e) => patch(i, { caption: e.target.value })}
                      />
                    </div>
                  )}
                  {b.type === "video" && (
                    <Input
                      placeholder="URL de YouTube o Google Drive"
                      value={b.url ?? ""}
                      onChange={(e) => patch(i, { url: e.target.value })}
                    />
                  )}
                  {b.type === "pdf" && (
                    <div className="space-y-2">
                      <Input
                        placeholder="URL del PDF (Google Drive)"
                        value={b.url ?? ""}
                        onChange={(e) => patch(i, { url: e.target.value })}
                      />
                      <Input
                        placeholder="Título del documento"
                        value={b.title ?? ""}
                        onChange={(e) => patch(i, { title: e.target.value })}
                      />
                    </div>
                  )}
                  {b.type === "table" && (
                    <div className="space-y-1.5">
                      <textarea
                        rows={5}
                        placeholder={
                          "Una fila por línea, celdas separadas por |\nLa primera línea son los encabezados.\nEj.\nTipo | Recirculación\nResidencial | 6 horas"
                        }
                        className={`${areaClass} font-mono text-xs`}
                        value={tableToText(b.headers, b.rows)}
                        onChange={(e) => {
                          const { headers, rows } = textToTable(e.target.value);
                          patch(i, { headers, rows });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Primera línea: encabezados. Celdas separadas por “|”.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Agregar bloque */}
            <div className="rounded-xl border border-dashed p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Agregar bloque
              </p>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => add(type)}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/8"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input de archivo compartido para los bloques de imagen */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileSelected}
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => guard.onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={save} disabled={pending} className="flex-1">
            {pending ? "Guardando..." : "Guardar lección"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

      <ConfirmarSalir
        open={guard.confirming}
        onKeep={guard.keepEditing}
        onLeave={guard.confirmLeave}
      />
    </>
  );
}
