"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  PlayCircle,
  FileDown,
  Image as ImageIcon,
  Circle,
  CheckCircle2,
  Lock,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

type LessonType = "TEXT" | "VIDEO" | "IMAGE" | "PDF" | "MIXED";

// Ítem de la secuencia del módulo: lección o examen, ya en orden.
export type ItemLite =
  | {
      kind: "lesson";
      id: string;
      title: string;
      type: LessonType;
      durationMin: number | null;
    }
  | { kind: "exam"; id: string; title: string };

type ModuleLite = {
  id: string;
  title: string;
  items: ItemLite[];
};

const LESSON_ICON: Record<LessonType, { icon: LucideIcon; className: string }> =
  {
    TEXT: { icon: FileText, className: "bg-primary/15 text-primary" },
    MIXED: { icon: FileText, className: "bg-primary/15 text-primary" },
    VIDEO: { icon: PlayCircle, className: "bg-destructive/10 text-destructive" },
    PDF: { icon: FileDown, className: "bg-success/10 text-success" },
    IMAGE: { icon: ImageIcon, className: "bg-gold/15 text-gold" },
  };

export function ModuloAccordion({
  courseId,
  modules,
  doneIds = [],
  unlockedIds = [],
  openModuleId,
}: {
  courseId: string;
  modules: ModuleLite[];
  doneIds?: string[]; // lecciones completadas + exámenes aprobados
  unlockedIds?: string[];
  openModuleId?: string;
}) {
  const done = new Set(doneIds);
  const unlocked = new Set(unlockedIds);
  const defaultOpen = openModuleId ?? modules[0]?.id;

  // Al volver de completar una lección (#continuar), hace scroll al módulo
  // pendiente en vez de saltar al inicio de la página.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#continuar") return;
    const el = defaultOpen ? document.getElementById(`mod-${defaultOpen}`) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [defaultOpen]);

  return (
    <Accordion
      defaultValue={defaultOpen ? [defaultOpen] : []}
      className="flex flex-col gap-3"
    >
      {modules.map((m, i) => {
        const doneInModule = m.items.filter((it) => done.has(it.id)).length;
        const moduleComplete =
          m.items.length > 0 && doneInModule === m.items.length;
        return (
          <AccordionItem
            key={m.id}
            id={`mod-${m.id}`}
            value={m.id}
            className="scroll-mt-6 overflow-hidden rounded-xl border bg-card not-last:border-b"
          >
            <AccordionTrigger className="items-center px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${
                    moduleComplete ? "bg-gold" : "bg-primary"
                  }`}
                >
                  {moduleComplete ? "✓" : i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-foreground">
                    {m.title}
                  </span>
                  <span
                    className={`block text-xs ${
                      moduleComplete ? "font-medium text-gold" : "text-muted-foreground"
                    }`}
                  >
                    {doneInModule}/{m.items.length} completados
                  </span>
                </span>
              </span>
            </AccordionTrigger>

            <AccordionContent className="px-0 [&_a]:no-underline">
              <div className="border-t">
                {m.items.map((it) => {
                  const isDone = done.has(it.id);
                  const isUnlocked = unlocked.has(it.id);
                  const isExam = it.kind === "exam";
                  const iconMeta = isExam
                    ? { icon: ClipboardCheck, className: "bg-gold/15 text-gold" }
                    : LESSON_ICON[it.type];
                  const Icon = iconMeta.icon;

                  const inner = (
                    <>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          isUnlocked ? iconMeta.className : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUnlocked ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          isUnlocked
                            ? isExam
                              ? "font-medium text-foreground"
                              : "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {it.title}
                      </span>
                      {isExam ? (
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isUnlocked ? "text-gold" : "text-muted-foreground"
                          }`}
                        >
                          Examen
                        </span>
                      ) : (
                        it.durationMin != null && (
                          <span className="text-xs text-muted-foreground">
                            {it.durationMin} min
                          </span>
                        )
                      )}
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : isUnlocked ? (
                        <Circle className="h-4 w-4 text-border" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                      )}
                    </>
                  );

                  const href = isExam
                    ? `/examenes/${it.id}`
                    : `/cursos/${courseId}/leccion/${it.id}`;

                  return isUnlocked ? (
                    <Link
                      key={`${it.kind}-${it.id}`}
                      href={href}
                      className="flex items-center gap-3 border-b px-5 py-3 pl-6 transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={`${it.kind}-${it.id}`}
                      className="flex cursor-not-allowed items-center gap-3 border-b px-5 py-3 pl-6 opacity-70 last:border-b-0"
                      title="Completa lo anterior para desbloquear"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
