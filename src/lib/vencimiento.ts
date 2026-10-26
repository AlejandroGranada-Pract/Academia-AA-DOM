// Estado de vencimiento de un curso para un usuario que aún no lo completó.
// Devuelve null si no hay fecha límite, si ya lo completó, o si falta mucho.

export type DueTone = "overdue" | "soon";
export type DueStatus = { label: string; tone: DueTone };

const DIA_MS = 1000 * 60 * 60 * 24;

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

// Fecha límite EFECTIVA para un empleado:
// - Plazo en días: (la más reciente entre el ingreso del empleado y la creación
//   del curso) + N días → cada empleado tiene su propia cuenta regresiva.
// - Fecha fija: la misma para todos.
// - Sin nada: null.
export function effectiveDueDate(
  _course: {
    dueDate: Date | string | null;
    dueDays: number | null;
    createdAt: Date | string;
  },
  _userCreatedAt: Date | string | null | undefined,
): Date | null {
  // Vencimientos DESACTIVADOS en toda la plataforma: cada empleado avanza a su
  // ritmo, sin fecha límite (decisión de negocio, jul-2026). Devolvemos null
  // siempre; así desaparecen las alertas "Vence en…" y los recordatorios por
  // vencimiento. Para reactivarlos, restaura la lógica original (ver historial).
  void toDate; // se conserva el helper por si se reactiva
  return null;
}

export function dueStatus(
  dueDate: Date | string | null | undefined,
  completed: boolean,
): DueStatus | null {
  if (!dueDate || completed) return null;
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(due.getTime())) return null;

  const hoy = new Date();
  const dias = Math.ceil((due.getTime() - hoy.getTime()) / DIA_MS);

  if (dias < 0) {
    const n = Math.abs(dias);
    return { label: n === 1 ? "Vencido hace 1 día" : `Vencido hace ${n} días`, tone: "overdue" };
  }
  if (dias === 0) return { label: "Vence hoy", tone: "soon" };
  if (dias <= 7) {
    return { label: dias === 1 ? "Vence mañana" : `Vence en ${dias} días`, tone: "soon" };
  }
  return null; // falta más de una semana: sin alerta
}
