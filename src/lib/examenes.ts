// Lógica compartida de intentos de examen (no es "use server": helpers puros).

// Si un examen no tiene tiempo límite, igual consideramos abandonado un intento
// "en curso" tras esta ventana (para que salirse cuente y no quede abierto eterno).
export const SESSION_DEFAULT_MIN = 120;

// Momento (ms) en que un intento en curso se considera vencido/abandonado.
export function attemptDeadlineMs(
  startedAt: Date | string,
  timeLimitMin: number | null,
): number {
  const start =
    typeof startedAt === "string"
      ? new Date(startedAt).getTime()
      : startedAt.getTime();
  return start + (timeLimitMin ?? SESSION_DEFAULT_MIN) * 60_000;
}
