/**
 * Primitives d'animation, exprimées en secondes locales à la scène.
 */
import { Easing, random, spring } from "remotion";
import { VIDEO } from "../theme";

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);

/** Progression 0 → 1 entre `start` et `start + duration`, avec easing. */
export const progress = (
  t: number,
  start: number,
  duration: number,
  easing: (v: number) => number = easeOut,
): number => easing(clamp01((t - start) / Math.max(duration, 1e-6)));

/** Interpolation linéaire. */
export const mix = (a: number, b: number, p: number): number => a + (b - a) * p;

/** Ressort 0 → 1 (léger dépassement) à partir de `start`. */
export const pop = (t: number, start: number, stiffness = 170): number =>
  spring({
    frame: (t - start) * VIDEO.fps,
    fps: VIDEO.fps,
    config: { damping: 13, stiffness, mass: 0.7 },
  });

/** Ressort amorti, sans dépassement. */
export const settle = (t: number, start: number): number =>
  spring({
    frame: (t - start) * VIDEO.fps,
    fps: VIDEO.fps,
    config: { damping: 200, stiffness: 90 },
  });

/** Entrée puis sortie : 0 → 1 → 0. */
export const inOut = (
  t: number,
  start: number,
  end: number,
  fadeIn = 0.25,
  fadeOut = 0.25,
): number =>
  Math.min(progress(t, start, fadeIn), 1 - progress(t, end - fadeOut, fadeOut));

/** Tremblement déterministe (en px), utile pour un téléphone qui vibre. */
export const shake = (t: number, amount: number, seed = 0): number =>
  (random(`shake-${seed}-${Math.floor(t * VIDEO.fps)}`) * 2 - 1) * amount;

/** Oscillation douce. */
export const wave = (t: number, period: number, phase = 0): number =>
  Math.sin(((t / period) * 2 + phase) * Math.PI);
