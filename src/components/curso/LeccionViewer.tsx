import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { VideoEmbed } from "@/components/curso/VideoEmbed";
import { PdfEmbed } from "@/components/curso/PdfEmbed";

// Tipos laxos: el contenido es JSON polimórfico (ver spec sección 6).
type Block = {
  type: "heading" | "paragraph" | "list" | "callout" | "image" | "video" | "pdf";
  text?: string;
  items?: string[];
  url?: string;
  caption?: string;
  title?: string;
  style?: "info" | "warning" | "tip";
};

type LessonContent = {
  blocks?: Block[];
  videoUrl?: string;
  pdfUrl?: string;
  url?: string;
  title?: string;
  caption?: string;
  description?: string;
};

const CALLOUT = {
  info: { icon: Info, className: "border-primary bg-primary/8" },
  warning: { icon: AlertTriangle, className: "border-warning bg-warning/10" },
  tip: { icon: Lightbulb, className: "border-gold bg-gold/8" },
} as const;

function Callout({ style = "info", text }: { style?: Block["style"]; text: string }) {
  const { icon: Icon, className } = CALLOUT[style ?? "info"];
  return (
    <div className={`flex gap-3 rounded-r-lg border-l-4 p-4 text-sm ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-foreground">{text}</p>
    </div>
  );
}

function ImageBlock({ url, caption }: { url: string; caption?: string }) {
  return (
    <figure className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={caption ?? ""} className="w-full rounded-xl border" />
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return <h2 className="text-2xl text-foreground">{block.text}</h2>;
    case "paragraph":
      return (
        <p className="leading-relaxed text-foreground/90">{block.text}</p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1 pl-5 text-foreground/90">
          {block.items?.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "callout":
      return <Callout style={block.style} text={block.text ?? ""} />;
    case "image":
      return block.url ? (
        <ImageBlock url={block.url} caption={block.caption} />
      ) : null;
    case "video":
      return block.url ? <VideoEmbed url={block.url} /> : null;
    case "pdf":
      return block.url ? <PdfEmbed url={block.url} title={block.title} /> : null;
    default:
      return null;
  }
}

export function LeccionViewer({
  type,
  content,
}: {
  type: "TEXT" | "VIDEO" | "IMAGE" | "PDF" | "MIXED";
  content: LessonContent;
}) {
  return (
    <article className="space-y-5 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm md:p-8">
      {/* TEXT y MIXED: lista de bloques */}
      {(type === "TEXT" || type === "MIXED") &&
        content.blocks?.map((block, i) => <BlockRenderer key={i} block={block} />)}

      {/* VIDEO */}
      {type === "VIDEO" && content.videoUrl && (
        <>
          <VideoEmbed url={content.videoUrl} />
          {content.description && (
            <p className="leading-relaxed text-foreground/90">
              {content.description}
            </p>
          )}
        </>
      )}

      {/* PDF */}
      {type === "PDF" && content.pdfUrl && (
        <PdfEmbed url={content.pdfUrl} title={content.title} />
      )}

      {/* IMAGE */}
      {type === "IMAGE" && content.url && (
        <ImageBlock url={content.url} caption={content.caption} />
      )}
    </article>
  );
}
