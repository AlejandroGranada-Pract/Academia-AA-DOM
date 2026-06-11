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
};

const GateContext = createContext<GateValue | null>(null);

export function useLeccionGate() {
  return useContext(GateContext);
}

// Coordina entre los videos de la lección y el botón de "Completar":
// el botón solo se habilita cuando todos los videos rastreables se vieron.
export function LeccionGate({ children }: { children: React.ReactNode }) {
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
    return { registerVideo, markWatched, hasVideos, allVideosWatched };
  }, [required, watched, registerVideo, markWatched]);

  return <GateContext.Provider value={value}>{children}</GateContext.Provider>;
}
