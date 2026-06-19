"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "@/lib/actions/usuarios";
import { useCierreGuard, ConfirmarSalir } from "@/components/admin/ConfirmarSalir";
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

export function NuevoUsuarioDialog({
  grupos,
  cursos,
}: {
  grupos: { id: string; name: string }[];
  cursos: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("EMPLOYEE");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const guard = useCierreGuard(dirty, () => setOpen(false));

  // Resetea estado cada vez que se abre.
  useEffect(() => {
    if (open) {
      setDirty(false);
      setRole("EMPLOYEE");
      setError(null);
    }
  }, [open]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const err = await createUser(fd);
      if (err) {
        setError(err);
      } else {
        formRef.current?.reset();
        setDirty(false);
        setOpen(false);
        toast.success("Usuario creado");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <UserPlus className="h-4 w-4" />
        Nuevo usuario
      </Button>

      <Dialog open={open} onOpenChange={guard.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Crea una cuenta y asígnale rol, empresa y área.
            </DialogDescription>
          </DialogHeader>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            onChange={() => setDirty(true)}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  name="role"
                  className={selectClass}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="AREA_LEADER">Líder de Área</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="EXTERNAL">Externo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Empresa</Label>
                <select id="company" name="company" className={selectClass} defaultValue="AMBIENTE_AZUL">
                  <option value="AMBIENTE_AZUL">Ambiente Azul</option>
                  <option value="DOM_DESIGN">DOM Design</option>
                  <option value="AMBAS">Ambas</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Grupos (definen qué cursos verá)</Label>
              {grupos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No hay grupos creados todavía. Puedes crearlos en la sección
                  Grupos.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {grupos.map((g) => (
                    <label
                      key={g.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/8"
                    >
                      <input
                        type="checkbox"
                        name="grupoIds"
                        value={g.id}
                        className="accent-primary"
                      />
                      {g.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Grupos que lidera (solo para Líder de Área) */}
            {role === "AREA_LEADER" && grupos.length > 0 && (
              <div className="space-y-1.5 rounded-lg border border-gold/30 bg-gold/5 p-3">
                <Label>Grupos que lidera</Label>
                <p className="text-xs text-muted-foreground">
                  Verá el avance de los miembros de estos grupos en “Mi Equipo”.
                </p>
                <div className="flex flex-wrap gap-2">
                  {grupos.map((g) => (
                    <label
                      key={g.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/10"
                    >
                      <input
                        type="checkbox"
                        name="liderGrupoIds"
                        value={g.id}
                        className="accent-gold"
                      />
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Cursos extra (acceso directo, sin grupo) */}
            {cursos.length > 0 && (
              <div className="space-y-1.5">
                <Label>Cursos extra (acceso directo)</Label>
                <p className="text-xs text-muted-foreground">
                  Da acceso a cursos puntuales sin necesidad de meterlo a un grupo.
                </p>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  {cursos.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/8"
                    >
                      <input
                        type="checkbox"
                        name="cursoIds"
                        value={c.id}
                        className="accent-primary"
                      />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => guard.onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
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
