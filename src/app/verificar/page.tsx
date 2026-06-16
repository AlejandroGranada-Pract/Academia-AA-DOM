import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Verificación pública: el usuario escribe un código y lo enviamos a
// /verificar/[code]. Sin login (ver auth.config.ts).
async function irAVerificar(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim();
  if (code) redirect(`/verificar/${encodeURIComponent(code)}`);
}

export default function VerificarIndexPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-grafito via-[#2a2a2a] to-grafito p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-4">
          <span className="font-heading text-xl tracking-wider text-primary">
            AMBIENTE AZUL
          </span>
          <span className="h-7 w-px bg-white/30" />
          <span className="font-heading text-xl tracking-[0.25em] text-gold">
            DOM
          </span>
        </div>

        <div className="rounded-2xl border border-white/15 bg-grafito/40 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-2xl">
          <ShieldCheck className="mx-auto h-12 w-12 text-gold" />
          <h1 className="mt-4 text-center text-2xl text-white">
            Verificar certificado
          </h1>
          <p className="mt-1 text-center text-sm text-white/55">
            Ingresa el código que aparece en el certificado.
          </p>

          <form action={irAVerificar} className="mt-6 space-y-3">
            <Input
              name="code"
              required
              placeholder="CERT-2026-XXXXXXXX"
              autoComplete="off"
              className="border-white/25 bg-white/10 text-center font-mono uppercase tracking-wider text-white placeholder:text-white/40 focus-visible:border-primary"
            />
            <Button type="submit" className="w-full">
              Verificar
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
