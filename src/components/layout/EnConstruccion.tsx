import { Construction } from "lucide-react";
import { Header } from "@/components/layout/Header";

// Placeholder para pantallas que aún no se construyen (mantiene el layout/sidebar).
export function EnConstruccion({
  title,
  nota,
}: {
  title: string;
  nota: string;
}) {
  return (
    <div>
      <Header title={title} />
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-20 text-center">
        <Construction className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium text-foreground">En construcción</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{nota}</p>
      </div>
    </div>
  );
}
