"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { useLeccionGate } from "@/components/curso/LeccionGate";

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
  const [watched, setWatched] = useState(false);

  const registerVideo = gate?.registerVideo;
  const markWatchedInGate = gate?.markWatched;

  // Registra el video de YouTube como "requerido" para completar.
  useEffect(() => {
    if (ytId && registerVideo) registerVideo(videoKey);
  }, [ytId, registerVideo, videoKey]);

  // Crea el reproductor y detecta cuando se vio (~90% o terminado).
  useEffect(() => {
    if (!ytId || !containerRef.current) return;
    let player: any;
    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    function markWatched() {
      if (cancelled) return;
      if (interval) clearInterval(interval);
      setWatched(true);
      markWatchedInGate?.(videoKey);
    }

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
                  if (dur > 0 && cur / dur >= 0.9) markWatched();
                } catch {
                  /* noop */
                }
              }, 1000);
            } else {
              if (interval) clearInterval(interval);
              if (e.data === YT.PlayerState.ENDED) markWatched();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try {
        player?.destroy?.();
      } catch {
        /* noop */
      }
    };
  }, [ytId, markWatchedInGate, videoKey]);

  // --- YouTube (rastreable) ---
  if (ytId) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full">
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        </div>
        <p
          className={`flex items-center gap-1.5 text-xs ${
            watched ? "text-success" : "text-muted-foreground"
          }`}
        >
          {watched ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Video visto
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Mira el video completo para poder continuar.
            </>
          )}
        </p>
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
