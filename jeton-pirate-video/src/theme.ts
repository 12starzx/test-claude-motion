/**
 * Direction artistique : « nuit marine ».
 *
 * L'original jouait sur un noir de scène, des projecteurs blancs, un héros vert
 * et un jeton jaune. Cette version passe sur un bleu nuit profond, des faisceaux
 * de lune froids, un héros cyan et un jeton orange doré : même tension, autre
 * atmosphère.
 */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const palette = {
  /** Fond le plus sombre (bords, vignette). */
  night: "#03060f",
  /** Bleu nuit du fond. */
  navy: "#08112a",
  /** Bleu plus clair, au cœur des faisceaux. */
  deep: "#13234f",
  /** Remplissage des objets : masque ce qui est derrière. */
  ink: "#0a1330",
  inkLight: "#111d42",
  /** Trait principal des dessins. */
  line: "#e8eeff",
  lineSoft: "rgba(232, 238, 255, 0.6)",
  lineFaint: "rgba(232, 238, 255, 0.24)",
  /** Lumière des faisceaux. */
  beam: "190, 210, 255",
  /** Héros (« toi »). */
  hero: "#3fe3ff",
  heroGlow: "rgba(63, 227, 255, 0.55)",
  /** Coéquipiers. */
  mate: "#aab8dc",
  /** Jeton. */
  gold: "#ffa22b",
  goldLight: "#ffd98c",
  goldDeep: "#d9600c",
  goldGlow: "255, 140, 30",
  /** Texte. */
  text: "#f4f7ff",
} as const;

/** Zone verticale des sous-titres (haut du cadre, hors interface TikTok). */
export const CAPTION_TOP = 330;
