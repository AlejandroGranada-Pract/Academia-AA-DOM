import type { ReactNode } from "react";
import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { VideoEmbed } from "@/components/curso/VideoEmbed";
import { PdfEmbed } from "@/components/curso/PdfEmbed";
import { PromptBlock } from "@/components/curso/PromptBlock";

// Convierte texto plano en nodos con enlaces clicables. Soporta:
//  - Markdown: [texto](https://…) → enlace con nombre
//  - URLs sueltas: https://… o www.… → se vuelven clicables tal cual
const LINK_RE =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s<)]+)/gi;

function renderRich(text?: string | null): ReactNode {
  if (!text) return text ?? null;
  const nodes: ReactNode[] = [];
  const re = new RegExp(LINK_RE.source, "gi");
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  const link = (href: string, label: string) => (
    <a
      key={k++}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 break-words"
    >
      {label}
    </a>
  );
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      // [texto](url)
      nodes.push(link(m[2], m[1]));
    } else {
      // URL suelta: recorta puntuación final típica de la prosa
      let raw = m[3];
      const tm = raw.match(/[).,;:!?»"']+$/);
      const tail = tm ? tm[0] : "";
      if (tail) raw = raw.slice(0, raw.length - tail.length);
      nodes.push(link(raw.startsWith("www.") ? `https://${raw}` : raw, raw));
      if (tail) nodes.push(tail);
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// Tipos laxos: el contenido es JSON polimórfico (ver spec sección 6).
type Block = {
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "callout"
    | "image"
    | "video"
    | "pdf"
    | "table"
    | "prompt";
  text?: string;
  items?: string[];
  url?: string;
  caption?: string;
  title?: string;
  label?: string;
  style?: "info" | "warning" | "tip";
  headers?: string[];
  rows?: string[][];
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
      <p className="text-foreground">{renderRich(text)}</p>
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

function TableBlock({
  headers,
  rows,
}: {
  headers?: string[];
  rows?: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">
        {headers && headers.length > 0 && (
          <thead>
            <tr className="bg-muted/60">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="border-b px-3 py-2 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(rows ?? []).map((row, r) => (
            <tr key={r} className="even:bg-muted/20">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className="border-b px-3 py-2 align-top text-foreground/90 last:border-r-0"
                >
                  {renderRich(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="flex items-center gap-2.5 text-2xl text-foreground">
          <span className="h-5 w-1 shrink-0 rounded-full bg-gold" />
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="leading-relaxed text-foreground/90">{renderRich(block.text)}</p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1 pl-5 text-foreground/90">
          {block.items?.map((it, i) => <li key={i}>{renderRich(it)}</li>)}
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
    case "table":
      return <TableBlock headers={block.headers} rows={block.rows} />;
    case "prompt":
      return block.text ? (
        <PromptBlock text={block.text} label={block.label} />
      ) : null;
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
    <article className="space-y-5 rounded-2xl border border-white/60 dark:border-border bg-white/70 dark:bg-card p-6 shadow-[0_10px_40px_-12px_rgba(31,31,31,0.12)] backdrop-blur-sm md:p-8">
      {/* TEXT y MIXED: lista de bloques */}
      {(type === "TEXT" || type === "MIXED") &&
        content.blocks?.map((block, i) => <BlockRenderer key={i} block={block} />)}

      {/* VIDEO */}
      {type === "VIDEO" && content.videoUrl && (
        <>
          <VideoEmbed url={content.videoUrl} />
          {content.description && (
            <p className="leading-relaxed text-foreground/90">
              {renderRich(content.description)}
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
