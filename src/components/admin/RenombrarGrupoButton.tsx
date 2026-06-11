"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { renameGrupo } from "@/lib/actions/grupos";
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

export function RenombrarGrupoButton({
  grupoId,
  grupoName,
}: {
  grupoId: string;
  grupoName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(grupoName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const err = await renameGrupo(grupoId, name);
      if (err) setError(err);
      else {
        setOpen(false);
        toast.success("Grupo actualizado");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setName(grupoName);
          setError(null);
          setOpen(true);
        }}
        aria-label={`Editar grupo ${grupoName}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar grupo</DialogTitle>
            <DialogDescription>Cambia el nombre del grupo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="gname">Nombre</Label>
            <Input
              id="gname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button onClick={save} disabled={pending} className="w-full">
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
