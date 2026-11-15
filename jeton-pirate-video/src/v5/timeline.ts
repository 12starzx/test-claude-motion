/**
 * Conducteur de la vidéo 5 (« le blocus ») : dimanche soir, demain t'as cours,
 * et tu fais un blocus… pour le jeton. Mêmes conventions que src/timeline.ts.
 *
 * Instants provisoires (estimés) : recaler sur la voix avec
 *   TIMELINE=src/v5/timeline.ts node scripts/retime-from-transcript.mjs mots.json
 */
import { body, createTimeline, impact, serif } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // Dimanche soir
  { id: "tard", at: 0, parts: [body("Il est tard.")] },
  { id: "scrolles", at: 1.2, parts: [body("Tu scrolles.")] },
  {
    id: "toujoursPas",
    at: 2.4,
    parts: [body("Et t'as toujours pas eu"), impact("LE JETON PIRATE.", 1.2)],
  },
  { id: "lundi", at: 5.3, parts: [body("Demain, c'est lundi.")] },
  { id: "cours", at: 6.8, parts: [impact("T'AS COURS.")] },
  // Le blocus
  { id: "ecoute", at: 8.2, parts: [body("Alors écoute-moi bien :")] },
  {
    id: "blocus",
    at: 9.6,
    parts: [body("ce soir, tu fais"), impact("UN BLOCUS.", 0.9)],
  },
  { id: "maths", at: 11.8, parts: [serif("Pas pour les maths.")] },
  { id: "pourJeton", at: 13.0, parts: [impact("POUR LE JETON.")] },
  // L'échéance
  {
    id: "dec5",
    at: 14.4,
    parts: [body("Le 5 décembre,"), body("il disparaît.", 1.0)],
  },
  {
    id: "semaines",
    at: 16.6,
    parts: [body("Il reste"), impact("MOINS DE 3 SEMAINES.", 0.6)],
  },
  { id: "chaqueSoir", at: 19.0, parts: [body("Chaque soir où tu lâches,")] },
  { id: "chance", at: 20.6, parts: [impact("UNE CHANCE EN MOINS.")] },
  // Lundi
  { id: "fatigue", at: 22.4, parts: [serif("Oui, demain tu seras fatigué.")] },
  {
    id: "prof",
    at: 24.6,
    parts: [serif("Oui, ton prof va te regarder bizarrement.")],
  },
  { id: "dixAns", at: 27.4, parts: [body("Mais dans 10 ans,")] },
  {
    id: "personne",
    at: 28.8,
    parts: [body("personne ne se souviendra de ce lundi.")],
  },
  {
    id: "casier",
    at: 31.2,
    parts: [
      body("Le jeton, lui, sera toujours"),
      impact("DANS TON CASIER.", 1.3),
    ],
  },
  // L'appel
  { id: "reveille", at: 34.2, parts: [impact("RÉVEILLE TON ÉQUIPE.")] },
  { id: "console", at: 35.8, parts: [impact("ALLUME LA CONSOLE.")] },
  { id: "coffre", at: 37.3, parts: [impact("OUVRE CHAQUE COFFRE.")] },
  {
    id: "partie",
    at: 39.0,
    parts: [body("Ce soir, ce n'est pas une partie.")],
  },
  { id: "cestBlocus", at: 41.0, parts: [impact("C'EST UN BLOCUS.")] },
  // Le lendemain
  {
    id: "quandMeme",
    at: 42.8,
    parts: [serif("Et demain, tu vas en cours quand même.")],
  },
  {
    id: "avecJeton",
    at: 45.2,
    end: 49,
    parts: [body("Mais peut-être…"), impact("AVEC LE JETON.", 0.9)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 50;

export const timeline5 = createTimeline(cues, TOTAL_SECONDS);
