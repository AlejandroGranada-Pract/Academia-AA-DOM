"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type GateValue = {
  registerVideo: (id: string) => void;
  markWatched: (id: string) => void;
  hasVideos: boolean;
  allVideosWatched: boolean;
  // Lección actual (null en vista previa: no se registra avance) y % inicial
  // ya guardado por video (por URL), para mostrarlo y pre-desbloquear.
  lessonId: string | null;
  initialPct: Record<string, number>;
};

const GateContext = createContext<GateValue | null>(null);

export function useLeccionGate() {
  return useContext(GateContext);
}

// Coordina entre los videos de la lección y el botón de "Completar":
// el botón solo se habilita cuando todos los videos rastreables se vieron.
export function LeccionGate({
  children,
  lessonId = null,
  initialPct = {},
}: {
  children: React.ReactNode;
  lessonId?: string | null;
  initialPct?: Record<string, number>;
}) {
  const [required, setRequired] = useState<string[]>([]);
  const [watched, setWatched] = useState<string[]>([]);

  const registerVideo = useCallback((id: string) => {
    setRequired((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markWatched = useCallback((id: string) => {
    setWatched((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const value = useMemo<GateValue>(() => {
    const hasVideos = required.length > 0;
    const allVideosWatched = required.every((id) => watched.includes(id));
    return {
      registerVideo,
      markWatched,
      hasVideos,
      allVideosWatched,
      lessonId,
      initialPct,
    };
  }, [required, watched, registerVideo, markWatched, lessonId, initialPct]);

  return <GateContext.Provider value={value}>{children}</GateContext.Provider>;
}
