"use client";

import { useState, useTransition } from "react";
import { Search, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { setGrupoMembership } from "@/lib/actions/grupos";
import { useNavGuard, ConfirmarSalir } from "@/components/admin/ConfirmarSalir";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Item = { id: string; title: string; subtitle?: string; member: boolean };

function sameSet(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const x of Array.from(a)) if (!b.has(x)) return false;
  return true;
}

export function GrupoMembership({
  grupoId,
  courses,
  users,
}: {
  grupoId: string;
  courses: Item[];
  users: Item[];
}) {
  // "base" = lo guardado; la selección es local hasta pulsar Guardar.
  const [baseCourses, setBaseCourses] = useState(
    () => new Set(courses.filter((c) => c.member).map((c) => c.id)),
  );
  const [baseUsers, setBaseUsers] = useState(
    () => new Set(users.filter((u) => u.member).map((u) => u.id)),
  );
  const [selCourses, setSelCourses] = useState(() => new Set(baseCourses));
  const [selUsers, setSelUsers] = useState(() => new Set(baseUsers));
  const [pending, startTransition] = useTransition();

  const dirty =
    !sameSet(selCourses, baseCourses) || !sameSet(selUsers, baseUsers);

  // Avisa con un diálogo propio si intentas navegar a otra página con cambios.
  const nav = useNavGuard(dirty);

  function toggle(kind: "course" | "user", id: string) {
    const [sel, setSel] =
      kind === "course"
        ? ([selCourses, setSelCourses] as const)
        : ([selUsers, setSelUsers] as const);
    const next = new Set(sel);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSel(next);
  }

  function descartar() {
    setSelCourses(new Set(baseCourses));
    setSelUsers(new Set(baseUsers));
  }

  function guardar() {
    startTransition(async () => {
      await setGrupoMembership(
        grupoId,
        Array.from(selCourses),
        Array.from(selUsers),
      );
      setBaseCourses(new Set(selCourses));
      setBaseUsers(new Set(selUsers));
      toast.success("Cambios guardados");
    });
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Columna
          titulo="Cursos del grupo"
          placeholder="Buscar curso..."
          items={courses}
          selected={selCourses}
          onToggle={(id) => toggle("course", id)}
        />
        <Columna
          titulo="Usuarios del grupo"
          placeholder="Buscar usuario..."
          items={users}
          selected={selUsers}
          onToggle={(id) => toggle("user", id)}
        />
      </div>

      {/* Barra de guardado (aparece solo si hay cambios sin guardar) */}
      {dirty && (
        <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-white/95 dark:bg-card p-3 shadow-[0_12px_40px_-12px_rgba(31,31,31,0.35)] backdrop-blur">
          <span className="px-2 text-sm font-medium text-foreground">
            Tienes cambios sin guardar.
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={descartar} disabled={pending}>
              Descartar
            </Button>
            <Button onClick={guardar} disabled={pending} className="gap-1.5">
              <Save className="h-4 w-4" />
              {pending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      )}

      <ConfirmarSalir
        open={nav.confirming}
        onKeep={nav.keepEditing}
        onLeave={nav.confirmLeave}
      />
    </>
  );
}

function Columna({
  titulo,
  placeholder,
  items,
  selected,
  onToggle,
}: {
  titulo: string;
  placeholder: string;
  items: Item[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          (i.subtitle?.toLowerCase().includes(query) ?? false),
      )
    : items;

  return (
    <section className="rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-5 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.1)] backdrop-blur-sm">
      <h2 className="mb-3 text-lg font-semibold text-foreground">{titulo}</h2>
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="px-1 py-4 text-sm text-muted-foreground">
            Sin resultados para “{q}”.
          </p>
        ) : (
          filtered.map((i) => {
            const member = selected.has(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => onToggle(i.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  member
                    ? "border-primary bg-primary/8"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    member ? "border-primary bg-primary text-white" : "border-border"
                  }`}
                >
                  {member && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {i.title}
                  </span>
                  {i.subtitle && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {i.subtitle}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
