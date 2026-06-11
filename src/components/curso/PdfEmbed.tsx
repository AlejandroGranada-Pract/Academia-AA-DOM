import { FileDown, ExternalLink } from "lucide-react";

// Embebe un PDF (Google Drive o URL directa) y ofrece un enlace para abrirlo.
function toPreviewUrl(url: string): string {
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return url;
}

export function PdfEmbed({
  url,
  title = "Documento PDF",
}: {
  url: string;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileDown className="h-4 w-4 text-success" />
          {title}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Abrir <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        src={toPreviewUrl(url)}
        title={title}
        className="h-[480px] w-full"
      />
    </div>
  );
}
