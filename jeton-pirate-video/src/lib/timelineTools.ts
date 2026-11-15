/**
 * Outils communs aux conducteurs (un par vidéo) et contexte React qui
 * transmet le conducteur courant aux scènes, aux sous-titres et au son.
 */
import { createContext, useContext } from "react";
import { VIDEO } from "../theme";

export type PartKind = "body" | "impact" | "serif";

export type CuePart = {
  text: string;
  kind?: PartKind;
  /** Décalage (s) entre le début de la réplique et l'apparition de la ligne. */
  delay?: number;
};

export type Cue = {
  id: string;
  /** Apparition (s). */
  at: number;
  /** Disparition (s). Par défaut : apparition de la réplique suivante. */
  end?: number;
  parts: CuePart[];
};

export const body = (text: string, delay = 0): CuePart => ({ text, delay });
export const impact = (text: string, delay = 0): CuePart => ({
  text,
  kind: "impact",
  delay,
});
export const serif = (text: string, delay = 0): CuePart => ({
  text,
  kind: "serif",
  delay,
});

export const toFrames = (seconds: number): number =>
  Math.round(seconds * VIDEO.fps);

export type Timeline = {
  cues: Cue[];
  total: number;
  totalFrames: number;
  /** Instant (s) d'une réplique. */
  cueAt: (id: string) => number;
  /** Instant (s) de la ligne `index` d'une réplique (ex. le mot-choc). */
  cuePartAt: (id: string, index: number) => number;
  /** Fin (s) de la réplique d'indice `index`. */
  endOf: (index: number) => number;
};

export const createTimeline = (cues: Cue[], total: number): Timeline => {
  const byId = new Map(cues.map((cue) => [cue.id, cue]));
  const get = (id: string) => {
    const cue = byId.get(id);
    if (!cue) {
      throw new Error(`Réplique inconnue : « ${id} »`);
    }
    return cue;
  };
  return {
    cues,
    total,
    totalFrames: Math.round(total * VIDEO.fps),
    cueAt: (id) => get(id).at,
    cuePartAt: (id, index) => {
      const cue = get(id);
      const part = cue.parts[index];
      if (!part) {
        throw new Error(`Ligne ${index} inconnue pour la réplique « ${id} »`);
      }
      return cue.at + (part.delay ?? 0);
    },
    endOf: (index) => cues[index].end ?? cues[index + 1]?.at ?? total,
  };
};

const TimelineContext = createContext<Timeline | null>(null);

export const TimelineProvider = TimelineContext.Provider;

export const useTimeline = (): Timeline => {
  const timeline = useContext(TimelineContext);
  if (!timeline) {
    throw new Error("Aucun conducteur fourni (TimelineProvider manquant).");
  }
  return timeline;
};
