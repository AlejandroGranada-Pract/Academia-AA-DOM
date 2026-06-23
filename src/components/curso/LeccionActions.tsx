"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { setLessonProgress } from "@/lib/actions/progress";
import { useLeccionGate } from "@/components/curso/LeccionGate";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LeccionActions({
  lessonId,
  courseId,
  completed,
  preview = false,
  moduleId,
  nextHref,
}: {
  lessonId: string;
  courseId: string;
  completed: boolean;
  preview?: boolean; // vista previa del admin: no guarda progreso
  moduleId: string; // para volver al módulo donde estaba (sin reiniciar scroll)
  nextHref: string | null; // siguiente ítem del curso (botón "Continuar")
}) {
  const router = useRouter();
  const gate = useLeccionGate();
  // Si ya está completada no exigimos volver a deslizar.
  const [reachedEnd, setReachedEnd] = useState(completed);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [pending, setPending] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Detecta cuando el usuario llega al final del contenido.
  useEffect(() => {
    if (reachedEnd) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setReachedEnd(true);
      },
      { rootMargin: "0px 0px -48px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reachedEnd]);

  const courseHref = `/cursos/${courseId}${preview ? "?preview=1" : ""}`;

  // Marca completada y vuelve a la vista del curso para elegir la siguiente.
  async function complete() {
    setPending(true);
    setIsCompleted(true);
    try {
      const nuevasInsignias = await setLessonProgress(lessonId, courseId, true);
      for (const titulo of nuevasInsignias ?? []) {
        toast.success("¡Insignia desbloqueada! 🏅", { description: titulo });
      }
      // #continuar: el acordeón del curso hace scroll al módulo pendiente (sin saltar arriba)
      router.push(`${courseHref}#continuar`, { scroll: false });
    } catch {
      setPending(false);
    }
  }

  // Requisitos para completar: llegar al final + ver los videos (si los hay).
  const videosWatched = !gate?.hasVideos || gate.allVideosWatched;
  const canComplete = reachedEnd && videosWatched;

  return (
    <>
      {/* Sentinela: cuando entra en pantalla, el usuario llegó al final */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`${courseHref}#mod-${moduleId}`}
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al curso
        </Link>

        {preview ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Vista previa — el progreso no se guarda
            </span>
            {nextHref && (
              <Link href={nextHref} className={cn(buttonVariants(), "gap-1.5")}>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : isCompleted ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline" }),
              "pointer-events-none gap-1.5 border-success/40 text-success",
            )}
          >
            <Check className="h-4 w-4" />
            Completada
          </span>
        ) : (
          <Button
            onClick={complete}
            disabled={!canComplete || pending}
            className="gap-1.5"
          >
            {canComplete ? (
              <Check className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            Completar lección
          </Button>
        )}
      </div>

      {!preview && !isCompleted && !canComplete && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {!videosWatched
            ? "Mira el video completo para poder continuar."
            : "Desliza hasta el final para habilitar el botón."}
        </p>
      )}
    </>
  );
}
