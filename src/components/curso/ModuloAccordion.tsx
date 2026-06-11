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

type LessonLite = {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number | null;
};

type ExamLite = {
  id: string;
  title: string;
  passed: boolean;
};

type ModuleLite = {
  id: string;
  title: string;
  lessons: LessonLite[];
  exam?: ExamLite | null;
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
  completedLessonIds = [],
  unlockedLessonIds = [],
  openModuleId,
}: {
  courseId: string;
  modules: ModuleLite[];
  completedLessonIds?: string[];
  unlockedLessonIds?: string[];
  openModuleId?: string;
}) {
  const completed = new Set(completedLessonIds);
  const unlocked = new Set(unlockedLessonIds);
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
        const doneInModule = m.lessons.filter((l) => completed.has(l.id)).length;
        const allLessonsDone =
          m.lessons.length > 0 && doneInModule === m.lessons.length;
        return (
          <AccordionItem
            key={m.id}
            id={`mod-${m.id}`}
            value={m.id}
            className="scroll-mt-6 overflow-hidden rounded-xl border bg-card not-last:border-b"
          >
            <AccordionTrigger className="items-center px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-foreground">
                    {m.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {doneInModule}/{m.lessons.length}{" "}
                    {m.lessons.length === 1 ? "lección" : "lecciones"}
                  </span>
                </span>
              </span>
            </AccordionTrigger>

            <AccordionContent className="px-0 [&_a]:no-underline">
              <div className="border-t">
                {m.lessons.map((l) => {
                  const { icon: Icon, className } = LESSON_ICON[l.type];
                  const isDone = completed.has(l.id);
                  const isUnlocked = unlocked.has(l.id);

                  const inner = (
                    <>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          isUnlocked ? className : "bg-muted text-muted-foreground"
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
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {l.title}
                      </span>
                      {l.durationMin != null && (
                        <span className="text-xs text-muted-foreground">
                          {l.durationMin} min
                        </span>
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

                  return isUnlocked ? (
                    <Link
                      key={l.id}
                      href={`/cursos/${courseId}/leccion/${l.id}`}
                      className="flex items-center gap-3 border-b px-5 py-3 pl-6 transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={l.id}
                      className="flex cursor-not-allowed items-center gap-3 border-b px-5 py-3 pl-6 opacity-70 last:border-b-0"
                      title="Completa la lección anterior para desbloquear"
                    >
                      {inner}
                    </div>
                  );
                })}

                {/* Examen del módulo (se desbloquea al terminar las lecciones) */}
                {m.exam &&
                  (allLessonsDone ? (
                    <Link
                      href={`/examenes/${m.exam.id}`}
                      className="flex items-center gap-3 border-b px-5 py-3 pl-6 transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
                        <ClipboardCheck className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {m.exam.title}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                        Examen
                      </span>
                      {m.exam.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 text-border" />
                      )}
                    </Link>
                  ) : (
                    <div
                      className="flex cursor-not-allowed items-center gap-3 border-b px-5 py-3 pl-6 opacity-70 last:border-b-0"
                      title="Completa las lecciones del módulo para desbloquear el examen"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm text-muted-foreground">
                        {m.exam.title}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Examen
                      </span>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
