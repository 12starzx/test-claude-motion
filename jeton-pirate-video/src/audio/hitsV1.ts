/**
 * Bruitages de la vidéo 1, calés sur son conducteur.
 */
import { cueAt, cuePartAt, cues } from "../timeline";
import { impactHits, transitionHits } from "./Soundtrack";
import type { Hit, Tracks } from "./Soundtrack";

export const tracksV1: Tracks = {
  voice: "audio/voix-off.mp3",
  music: "audio/musique.mp3",
  bed: "audio/bed.mp3",
};

export const hitsV1 = (sceneStarts: number[]): Hit[] => [
  ...impactHits(cues),
  ...transitionHits(sceneStarts),
  // Le jeton
  { sound: "sparkle", at: 0.05, volume: 0.5, name: "Jeton : apparition" },
  {
    sound: "shatter",
    at: cueAt("disparait"),
    volume: 0.7,
    name: "Jeton : disparaît",
  },
  {
    sound: "sparkle",
    at: cueAt("trouve") + 0.1,
    volume: 0.45,
    name: "Jeton trouvé",
  },
  {
    sound: "sparkle",
    at: cueAt("toute") + 0.1,
    volume: 0.45,
    name: "Jeton partagé",
  },
  {
    sound: "sparkle",
    at: cueAt("peutEtre") + 0.2,
    volume: 0.35,
    name: "Rêve du jeton",
  },
  { sound: "sparkle", at: cueAt("pensant1"), volume: 0.3, name: "Pensée" },
  {
    sound: "sparkle",
    at: cueAt("non") + 0.05,
    volume: 0.4,
    name: "Jeton : non",
  },
  {
    sound: "shatter",
    at: cuePartAt("non", 1),
    volume: 0.6,
    name: "Jeton : brisé",
  },
  {
    sound: "sparkle",
    at: cueAt("estLa"),
    volume: 0.6,
    name: "Le jeton est là",
  },
  {
    sound: "sparkle",
    at: cuePartAt("pasAbandonne", 1),
    volume: 0.6,
    name: "Jetons de l'équipe",
  },
  // Téléphone
  { sound: "buzz", at: cueAt("repondra"), volume: 0.5, name: "Appel 1" },
  { sound: "buzz", at: cueAt("insiste"), volume: 0.6, name: "Appel insistant" },
  {
    sound: "buzz",
    at: cueAt("insiste") + 0.45,
    volume: 0.6,
    name: "Appel insistant 2",
  },
  {
    sound: "buzz",
    at: cueAt("rappelle"),
    volume: 0.35,
    name: "Rappel des potes",
  },
  // Coffres
  { sound: "chest", at: cueAt("rien"), volume: 0.6, name: "Coffre vide" },
  {
    sound: "chest",
    at: cueAt("bandage") - 0.05,
    volume: 0.6,
    name: "Coffre : bandage",
  },
  {
    sound: "chest",
    at: cueAt("toujoursRien") + 0.05,
    volume: 0.6,
    name: "Coffre vide 2",
  },
  {
    sound: "chest",
    at: cueAt("ouvres") + 0.15,
    volume: 0.7,
    name: "Le coffre s'ouvre",
  },
  // Horloge et minuteur
  ...Array.from({ length: 10 }, (_, i) => ({
    sound: "tick" as const,
    at: cueAt("dec4") + 0.15 + i * 0.13,
    volume: 0.25,
    name: `Horloge ${i + 1}`,
  })),
  { sound: "tick", at: cuePartAt("minutes", 1), volume: 0.4, name: "Minuteur" },
];
