/**
 * Primitives d'animation : ressorts, enveloppes et transitions de scène.
 * Toutes les entrées passent par spring() (jamais d'interpolation linéaire).
 */
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SpringConfig } from "remotion";
import { springs, timings } from "../theme";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Ressort 0 → 1 démarrant à `delay` (frames). */
export const springAt = (
  frame: number,
  fps: number,
  delay: number,
  config: Partial<SpringConfig> = springs.smooth,
  durationInFrames?: number,
): number =>
  spring({
    frame: frame - delay,
    fps,
    config,
    durationInFrames,
  });

/**
 * Enveloppe « attaque puis relâche » pilotée par deux ressorts.
 * Monte vers 1 à partir de `start`, puis redescend vers `sustain`.
 */
export const pulseEnvelope = (
  frame: number,
  fps: number,
  start: number,
  attack: number,
  release: number,
  sustain = 0,
): number => {
  const up = springAt(frame, fps, start, springs.smooth, attack);
  const down = springAt(frame, fps, start + attack, springs.smooth, release);
  return up * (1 - down * (1 - sustain));
};

/** Mélange linéaire entre deux valeurs (utilitaire de composition). */
export const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

export type SceneEdge = "cut" | "fade";

export type SceneMotion = {
  /** Visibilité globale de la scène (fondu de sortie). */
  opacity: number;
  /**
   * Décalage vertical de parallaxe pour un calque de profondeur donnée :
   * plus `depth` est grand, plus le calque bouge (premier plan).
   */
  parallaxY: (depth: number) => number;
};

/**
 * Transition « fondu + parallaxe » d'une scène.
 * - "fade" : parallaxe d'entrée par ressort sur `timings.enter` frames ;
 *   sortie (fondu + parallaxe) sur les `timings.exit` dernières frames,
 *   qui chevauchent l'entrée de la scène suivante (`timings.overlap`).
 * - "cut"  : continuité (la console reste en place d'une scène à l'autre).
 */
export const useSceneMotion = ({
  duration,
  enter,
  exit,
  amplitude,
}: {
  duration: number;
  enter: SceneEdge;
  exit: SceneEdge;
  amplitude: number;
}): SceneMotion => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress =
    enter === "fade"
      ? springAt(frame, fps, 0, springs.smooth, timings.enter)
      : 1;
  // Sortie (pas une entrée) : accélération progressive qui s'achève pile au
  // raccord, pour que la scène sortante soit encore visible pendant les
  // frames de chevauchement avec la scène entrante.
  const exitProgress =
    exit === "fade"
      ? interpolate(frame, [duration - timings.exit, duration], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.quad),
        })
      : 0;

  return {
    // Chaque élément gère sa propre entrée en ressort (stagger) : la scène
    // n'ajoute pas de fondu d'entrée global, qui creuserait un « trou » noir
    // au raccord. Elle porte en revanche le fondu de sortie.
    opacity: 1 - exitProgress,
    parallaxY: (depth: number) =>
      (1 - enterProgress) * amplitude * depth -
      exitProgress * amplitude * 0.8 * depth,
  };
};

/** Clignotement doux du curseur (période ~1 s), sur la frame globale. */
export const cursorBlink = (globalFrame: number, fps: number): number => {
  const period = fps * 1.06;
  const wave = Math.cos((2 * Math.PI * globalFrame) / period);
  return interpolate(wave, [-0.35, 0.35], [0, 1], clamp);
};
