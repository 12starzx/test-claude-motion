/**
 * Plan de la bande-son : fichiers, niveaux et calages.
 *
 * Déposez vos fichiers (libres de droits) dans /public/audio sous ces noms,
 * ou modifiez les chemins ci-dessous. Un fichier absent est ignoré sans
 * erreur : le rendu fonctionne toujours, avec ou sans son.
 */

export const soundFiles = {
  /** Nappe ambiante tech, sur toute la durée (bouclée si plus courte). */
  ambient: "audio/ambient.mp3",
  /** Tick de frappe, un par caractère (scène 2). */
  typeTick: "audio/type-tick.wav",
  /** Montée pendant le traitement (scène 3). */
  riser: "audio/riser.mp3",
  /** Souffle de la révélation (scène 4). */
  whoosh: "audio/whoosh.wav",
  /** Impact grave de la révélation (scène 4). */
  boom: "audio/boom.wav",
  /** Tick d'interface à l'apparition de chaque carte (scène 4). */
  uiTick: "audio/ui-tick.wav",
  /** Résolution douce de l'outro (scène 6). */
  resolve: "audio/resolve.mp3",
} as const;

export type SoundId = keyof typeof soundFiles;

/** Volumes (0 à 1). */
export const soundLevels: Record<SoundId, number> = {
  ambient: 0.3,
  typeTick: 0.3,
  riser: 0.55,
  whoosh: 0.45,
  boom: 0.55,
  uiTick: 0.4,
  resolve: 0.65,
};

/** Réglages de calage (en frames). */
export const soundTiming = {
  /** Fondu d'entrée / de sortie de la nappe. */
  ambientFadeIn: 45,
  ambientFadeOut: 60,
  /** Le whoosh démarre avant la révélation pour culminer pile dessus. */
  whooshLead: 9,
  /** Le riser s'éteint en douceur juste avant l'impact. */
  riserFadeOut: 4,
} as const;
