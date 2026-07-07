"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { useLeccionGate } from "@/components/curso/LeccionGate";
import { registrarAvanceVideo } from "@/lib/actions/progress";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Carga la API del reproductor de YouTube una sola vez.
let ytApiPromise: Promise<any> | null = null;
function loadYouTubeApi(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}
function parseDriveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  return m ? m[1] : null;
}

export function VideoEmbed({
  url,
  title = "Video de la lección",
}: {
  url: string;
  title?: string;
}) {
  const gate = useLeccionGate();
  const videoKey = useId();
  const ytId = parseYouTubeId(url);
  const driveId = parseDriveId(url);
  const containerRef = useRef<HTMLDivElement>(null);

  const registerVideo = gate?.registerVideo;
  const markWatchedInGate = gate?.markWatched;
  const lessonId = gate?.lessonId ?? null;
  const savedInicial = (ytId && gate?.initialPct?.[url]) || 0;

  const [pct, setPct] = useState<number>(savedInicial);
  const watched = pct >= 90;
  const maxRef = useRef<number>(savedInicial); // máximo visto en esta sesión
  const savedRef = useRef<number>(savedInicial); // último % guardado en servidor

  // Guarda el avance en el servidor. Throttle: solo si subió ≥5 puntos (o forzado).
  const guardar = useCallback(
    (p: number, forzar = false) => {
      if (!lessonId || !ytId) return; // en vista previa (lessonId null) no se guarda
      if (!forzar && p - savedRef.current < 5) return;
      savedRef.current = p;
      void registrarAvanceVideo(lessonId, url, p).catch(() => {});
    },
    [lessonId, ytId, url],
  );

  // Sube el % visto (monótono), refleja en pantalla, desbloquea y guarda.
  const bump = useCallback(
    (raw: number) => {
      const v = Math.min(100, Math.max(0, Math.round(raw)));
      const prev = maxRef.current;
      if (v <= prev) return;
      maxRef.current = v;
      setPct(v);
      const cruzoUmbral = v >= 90 && prev < 90;
      if (cruzoUmbral) markWatchedInGate?.(videoKey);
      guardar(v, cruzoUmbral || v >= 100);
    },
    [markWatchedInGate, videoKey, guardar],
  );

  // Registra el video como requerido; si ya venía visto (≥90%), pre-desbloquea.
  useEffect(() => {
    if (!ytId) return;
    registerVideo?.(videoKey);
    if (savedInicial >= 90) markWatchedInGate?.(videoKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytId, videoKey]);

  // Crea el reproductor y sigue el avance (cada segundo mientras reproduce).
  useEffect(() => {
    if (!ytId || !containerRef.current) return;
    let player: any;
    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !containerRef.current) return;
      player = new YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        videoId: ytId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) {
              interval = setInterval(() => {
                try {
                  const cur = player.getCurrentTime?.() ?? 0;
                  const dur = player.getDuration?.() ?? 0;
                  if (dur > 0) bump((cur / dur) * 100);
                } catch {
                  /* noop */
                }
              }, 1000);
            } else {
              if (interval) clearInterval(interval);
              if (e.data === YT.PlayerState.ENDED) bump(100);
              else guardar(maxRef.current, true); // pausa: guarda lo alcanzado
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      guardar(maxRef.current, true); // al salir, guarda lo visto
      try {
        player?.destroy?.();
      } catch {
        /* noop */
      }
    };
  }, [ytId, bump, guardar]);

  // --- YouTube (rastreable) ---
  if (ytId) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full">
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        </div>
        {/* Barra de avance + texto con el % visto */}
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${watched ? "bg-success" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p
            className={`flex items-center gap-1.5 text-xs ${
              watched ? "text-success" : "text-muted-foreground"
            }`}
          >
            {watched ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Video visto ({pct}%)
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Has visto {pct}% — míralo completo para poder continuar.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // --- Google Drive u otra fuente (no rastreable): embed simple ---
  const src = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : url;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
