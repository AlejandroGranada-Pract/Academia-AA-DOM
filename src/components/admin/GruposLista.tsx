"use client";

import { useState } from "react";
import Link from "next/link";
import { Boxes, BookOpen, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RenombrarGrupoButton } from "@/components/admin/RenombrarGrupoButton";
import { EliminarGrupoButton } from "@/components/admin/EliminarGrupoButton";

type GrupoItem = {
  id: string;
  name: string;
  courses: number;
  users: number;
};

export function GruposLista({ grupos }: { grupos: GrupoItem[] }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? grupos.filter((g) => g.name.toLowerCase().includes(query))
    : grupos;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar grupo..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card/50 p-6 text-center text-sm text-muted-foreground">
          {query ? `Sin resultados para “${q}”.` : "Aún no hay grupos."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="flex flex-col rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="h-5 w-5" />
                </span>
                <span className="font-heading text-xl text-foreground">
                  {g.name}
                </span>
              </div>
              <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {g.courses} cursos
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {g.users} usuarios
                </span>
              </div>
              <div className="mt-auto flex items-center gap-2">
                <Link
                  href={`/grupos/${g.id}`}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary/80"
                >
                  Gestionar
                </Link>
                <RenombrarGrupoButton grupoId={g.id} grupoName={g.name} />
                <EliminarGrupoButton grupoId={g.id} grupoName={g.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
