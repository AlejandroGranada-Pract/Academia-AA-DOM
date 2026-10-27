// Protección común para los scripts de prisma/: todos escriben en la base que
// indique DATABASE_URL. Si no es local, exigen confirmación explícita con
// ALLOW_PROD_WRITE=1 (evita correr por error un script contra producción).
// Los scripts destructivos (seed de desarrollo) se niegan siempre fuera de local.

function hostDe(connectionString: string): string {
  try {
    return new URL(connectionString).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function esBaseLocal(connectionString: string): boolean {
  const h = hostDe(connectionString);
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]";
}

export function confirmarDestino(
  connectionString: string | undefined,
  opciones: { destructivo?: boolean } = {},
): string {
  if (!connectionString) {
    console.error("❌ Falta DATABASE_URL.");
    process.exit(1);
  }
  if (esBaseLocal(connectionString)) return connectionString;

  const host = hostDe(connectionString) || "(desconocido)";
  if (opciones.destructivo) {
    console.error(
      `❌ Este script borra datos y solo puede correr contra una base local (destino: ${host}).`,
    );
    process.exit(1);
  }
  if (process.env.ALLOW_PROD_WRITE !== "1") {
    console.error(
      `❌ DATABASE_URL apunta a una base no local (${host}). Si de verdad quieres ` +
        "escribir ahí, vuelve a ejecutar con ALLOW_PROD_WRITE=1.",
    );
    process.exit(1);
  }
  console.warn(`⚠️  Escribiendo en base NO local: ${host}`);
  return connectionString;
}
