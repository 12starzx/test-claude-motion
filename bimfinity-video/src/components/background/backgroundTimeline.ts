/**
 * État du fond à une frame donnée : allumage, bloom, dérive de parallaxe.
 * Partagé par le shader et par le fallback CSS pour un rendu identique.
 */
import { interpolate, Easing } from "remotion";
import { clamp, pulseEnvelope, springAt } from "../../lib/motion";
import { background, springs, timings } from "../../theme";

export type BackgroundState = {
  /** Temps du shader, en secondes « d'écoulement ». */
  time: number;
  /** 0 = noir, 1 = pleinement allumé. */
  intensity: number;
  /** Intensité du halo. */
  bloom: number;
  /** Dérive verticale (unités normalisées). */
  drift: number;
};

export const getBackgroundState = (frame: number, fps: number): BackgroundState => {
  const { scenes } = timings;

  // Scène 1 : le shader s'allume dans le noir.
  const intensity = springAt(frame, fps, 2, springs.smooth, 60);

  // Scène 3 : montée progressive pendant le traitement (calée sur le riser).
  const buildUp = interpolate(
    frame,
    [scenes.processing.from, scenes.reveal.from],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.quad) },
  );
  const buildUpRelease = springAt(frame, fps, scenes.reveal.from, springs.smooth, 20);

  // Scène 4 : flash de bloom sur la révélation, puis palier soutenu.
  const revealFlash = pulseEnvelope(frame, fps, scenes.reveal.from - 2, 8, 40, 0.38);

  // Scènes 5 et 6 : retour au calme.
  const calm = springAt(frame, fps, scenes.value.from, springs.smooth, 30);
  const outroCalm = springAt(frame, fps, scenes.outro.from, springs.smooth, 40);

  const bloom =
    0.22 +
    0.3 * buildUp * (1 - buildUpRelease) +
    0.78 * revealFlash * (1 - calm) +
    0.12 * calm * (1 - outroCalm) +
    0.06 * outroCalm;

  // Parallaxe : à chaque changement de scène, le fond glisse légèrement
  // (moins vite que le premier plan, d'où l'effet de profondeur).
  const boundaries = [
    scenes.processing.from,
    scenes.reveal.from,
    scenes.value.from,
    scenes.outro.from,
  ];
  const drift = boundaries.reduce(
    (sum, boundary, index) =>
      sum + (index % 2 === 0 ? 0.035 : -0.028) * springAt(frame, fps, boundary - 4, springs.smooth, 34),
    0,
  );

  return {
    time: (frame / fps) * background.flowSpeed,
    intensity,
    bloom,
    drift,
  };
};
