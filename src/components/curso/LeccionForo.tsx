"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, Trash2, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { postComment, deleteComment } from "@/lib/actions/foro";
import { Button } from "@/components/ui/button";

type Role = "SUPER_ADMIN" | "AREA_LEADER" | "EMPLOYEE" | "EXTERNAL";
type Autor = { id: string; name: string; role: Role };
type Mensaje = { id: string; body: string; createdAt: string; author: Autor };
type Comentario = Mensaje & { replies: Mensaje[] };

function iniciales(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function etiquetaRol(role: Role): { label: string; cls: string } | null {
  if (role === "SUPER_ADMIN")
    return { label: "Admin", cls: "bg-primary/15 text-primary" };
  if (role === "AREA_LEADER")
    return { label: "Líder", cls: "bg-gold/15 text-gold" };
  return null;
}

function hace(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "hace un momento";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

export function LeccionForo({
  lessonId,
  courseId,
  currentUserId,
  isAdmin,
  comments,
}: {
  lessonId: string;
  courseId: string;
  currentUserId: string | null;
  isAdmin: boolean;
  comments: Comentario[];
}) {
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl text-foreground">
        <MessageCircle className="h-5 w-5 text-gold" />
        Preguntas y comentarios
        {total > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({total})
          </span>
        )}
      </h2>

      {/* Nueva pregunta */}
      {currentUserId && (
        <Formulario
          lessonId={lessonId}
          courseId={courseId}
          placeholder="Escribe una pregunta o comentario sobre esta lección…"
        />
      )}

      {/* Lista */}
      {comments.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Aún no hay comentarios. ¡Sé el primero en preguntar!
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {comments.map((c) => (
            <ComentarioItem
              key={c.id}
              comentario={c}
              lessonId={lessonId}
              courseId={courseId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ComentarioItem({
  comentario,
  lessonId,
  courseId,
  currentUserId,
  isAdmin,
}: {
  comentario: Comentario;
  lessonId: string;
  courseId: string;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [respondiendo, setRespondiendo] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Burbuja
        mensaje={comentario}
        lessonId={lessonId}
        courseId={courseId}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />

      {/* Respuestas */}
      {comentario.replies.length > 0 && (
        <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
          {comentario.replies.map((r) => (
            <Burbuja
              key={r.id}
              mensaje={r}
              lessonId={lessonId}
              courseId={courseId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Responder */}
      {currentUserId &&
        (respondiendo ? (
          <div className="mt-3 pl-4">
            <Formulario
              lessonId={lessonId}
              courseId={courseId}
              parentId={comentario.id}
              placeholder="Escribe una respuesta…"
              autoFocus
              onDone={() => setRespondiendo(false)}
              onCancel={() => setRespondiendo(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRespondiendo(true)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            Responder
          </button>
        ))}
    </div>
  );
}

function Burbuja({
  mensaje,
  lessonId,
  courseId,
  currentUserId,
  isAdmin,
}: {
  mensaje: Mensaje;
  lessonId: string;
  courseId: string;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const tag = etiquetaRol(mensaje.author.role);
  const puedeBorrar = isAdmin || mensaje.author.id === currentUserId;

  function borrar() {
    if (!window.confirm("¿Borrar este comentario?")) return;
    startTransition(async () => {
      const res = await deleteComment({ id: mensaje.id, courseId, lessonId });
      if (res.ok) {
        toast.success("Comentario borrado");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
        {iniciales(mensaje.author.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {mensaje.author.name}
          </span>
          {mensaje.author.id === currentUserId && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Tú
            </span>
          )}
          {tag && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${tag.cls}`}
            >
              {tag.label}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {hace(mensaje.createdAt)}
          </span>
          {puedeBorrar && (
            <button
              type="button"
              onClick={borrar}
              disabled={pending}
              aria-label="Borrar comentario"
              className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">
          {mensaje.body}
        </p>
      </div>
    </div>
  );
}

function Formulario({
  lessonId,
  courseId,
  parentId,
  placeholder,
  autoFocus,
  onDone,
  onCancel,
}: {
  lessonId: string;
  courseId: string;
  parentId?: string;
  placeholder: string;
  autoFocus?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function enviar() {
    const texto = body.trim();
    if (!texto) return;
    startTransition(async () => {
      const res = await postComment({
        lessonId,
        courseId,
        body: texto,
        parentId: parentId ?? null,
      });
      if (res.ok) {
        setBody("");
        onDone?.();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        maxLength={2000}
        className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={enviar}
          disabled={pending || !body.trim()}
          className="gap-1.5"
        >
          <Send className="h-4 w-4" />
          {parentId ? "Responder" : "Publicar"}
        </Button>
      </div>
    </div>
  );
}
