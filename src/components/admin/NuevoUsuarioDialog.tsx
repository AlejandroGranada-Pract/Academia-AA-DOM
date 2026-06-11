"use client";

import { useRef, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { createUser } from "@/lib/actions/usuarios";
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

export function NuevoUsuarioDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

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
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <UserPlus className="h-4 w-4" />
        Nuevo usuario
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Crea una cuenta y asígnale rol, empresa y área.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
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
                <select id="role" name="role" className={selectClass} defaultValue="EMPLOYEE">
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
              <Label htmlFor="area">Área</Label>
              <Input
                id="area"
                name="area"
                placeholder="Comercial, Técnico, Compras, Bodega…"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Creando..." : "Crear usuario"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
