"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateUser, deleteUser } from "@/lib/actions/usuarios";
import { ToggleActivo } from "@/components/admin/ToggleActivo";
import { useCierreGuard, ConfirmarSalir } from "@/components/admin/ConfirmarSalir";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  AREA_LEADER: "Líder de Área",
  EMPLOYEE: "Empleado",
  EXTERNAL: "Externo",
};
const COMPANY_LABEL: Record<string, string> = {
  AMBIENTE_AZUL: "Ambiente Azul",
  DOM_DESIGN: "DOM Design",
  AMBAS: "AA | DOM",
};
const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring";

export type UsuarioRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  active: boolean;
  grupoIds: string[];
  grupoNames: string[];
  liderGrupoIds: string[];
  liderGrupoNames: string[];
  cursoIds: string[];
};

export function UsuariosTabla({
  usuarios,
  grupos,
  cursos,
}: {
  usuarios: UsuarioRow[];
  grupos: { id: string; name: string }[];
  cursos: { id: string; title: string }[];
}) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<UsuarioRow | null>(null);
  const [viewing, setViewing] = useState<UsuarioRow | null>(null);
  const [deleting, setDeleting] = useState<UsuarioRow | null>(null);
  const [editDirty, setEditDirty] = useState(false);
  const editGuard = useCierreGuard(editDirty, () => setEditing(null));

  // Resetea "cambios sin guardar" al abrir/cambiar el usuario en edición.
  useEffect(() => {
    setEditDirty(false);
  }, [editing]);

  const query = q.trim().toLowerCase();
  const filtered = query
    ? usuarios.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      )
    : usuarios;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Grupos</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="px-4 py-3">{COMPANY_LABEL[u.company] ?? u.company}</td>
                  <td className="px-4 py-3">
                    {u.grupoNames.length > 0 ? u.grupoNames.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleActivo userId={u.id} active={u.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn label="Ver detalles" onClick={() => setViewing(u)}>
                        <Eye className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Editar" onClick={() => setEditing(u)}>
                        <Pencil className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        label="Eliminar"
                        danger
                        onClick={() => setDeleting(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ver detalles */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Detalles del usuario</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="space-y-2.5 text-sm">
              <Row label="Correo" value={viewing.email} />
              <Row label="Rol" value={ROLE_LABEL[viewing.role] ?? viewing.role} />
              <Row
                label="Empresa"
                value={COMPANY_LABEL[viewing.company] ?? viewing.company}
              />
              <Row
                label="Grupos"
                value={
                  viewing.grupoNames.length > 0
                    ? viewing.grupoNames.join(", ")
                    : "—"
                }
              />
              {viewing.role === "AREA_LEADER" && (
                <Row
                  label="Grupos que lidera"
                  value={
                    viewing.liderGrupoNames.length > 0
                      ? viewing.liderGrupoNames.join(", ")
                      : "—"
                  }
                />
              )}
              <Row label="Estado" value={viewing.active ? "Activo" : "Inactivo"} />
            </dl>
          )}
        </DialogContent>
      </Dialog>

      {/* Editar */}
      <Dialog open={!!editing} onOpenChange={editGuard.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          {editing && (
            <EditarForm
              key={editing.id}
              user={editing}
              grupos={grupos}
              cursos={cursos}
              onDirty={() => setEditDirty(true)}
              onCancel={() => editGuard.onOpenChange(false)}
              onDone={() => {
                setEditDirty(false);
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmarSalir
        open={editGuard.confirming}
        onKeep={editGuard.keepEditing}
        onLeave={editGuard.confirmLeave}
      />

      {/* Eliminar */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar a <strong>{deleting?.name}</strong>?
              Se borrará su progreso e intentos. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DeleteFooter user={deleting} onClose={() => setDeleting(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors ${
        danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function EditarForm({
  user,
  grupos,
  cursos,
  onDone,
  onCancel,
  onDirty,
}: {
  user: UsuarioRow;
  grupos: { id: string; name: string }[];
  cursos: { id: string; title: string }[];
  onDone: () => void;
  onCancel: () => void;
  onDirty: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(user.role);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const err = await updateUser(user.id, fd);
      if (err) setError(err);
      else {
        onDone();
        toast.success("Usuario actualizado");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} onChange={onDirty} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
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
          <select id="company" name="company" className={selectClass} defaultValue={user.company}>
            <option value="AMBIENTE_AZUL">Ambiente Azul</option>
            <option value="DOM_DESIGN">DOM Design</option>
            <option value="AMBAS">Ambas</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Grupos</Label>
        {grupos.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hay grupos creados.</p>
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
                  defaultChecked={user.grupoIds.includes(g.id)}
                  className="accent-primary"
                />
                {g.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Grupos que lidera (solo Líder de Área) */}
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
                  defaultChecked={user.liderGrupoIds.includes(g.id)}
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
            Acceso a cursos puntuales sin pertenecer a un grupo.
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
                  defaultChecked={user.cursoIds.includes(c.id)}
                  className="accent-primary"
                />
                {c.title}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password">Nueva contraseña (opcional)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Dejar vacío para no cambiarla"
          minLength={6}
        />
      </div>
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
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function DeleteFooter({
  user,
  onClose,
}: {
  user: UsuarioRow | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function confirmar() {
    if (!user) return;
    startTransition(async () => {
      const err = await deleteUser(user.id);
      if (err) {
        toast.error(err);
      } else {
        toast.success("Usuario eliminado");
      }
      onClose();
    });
  }

  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="destructive" onClick={confirmar} disabled={pending}>
        {pending ? "Eliminando..." : "Eliminar"}
      </Button>
    </DialogFooter>
  );
}
