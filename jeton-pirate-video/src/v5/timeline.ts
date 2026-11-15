/**
 * Conducteur de la vidéo 5 (« le blocus ») : lundi matin, t'as cours, et ce
 * soir tu fais un blocus… pour le jeton. Mêmes conventions que src/timeline.ts.
 *
 * Instants provisoires (estimés) : recaler sur la voix avec
 *   TIMELINE=src/v5/timeline.ts node scripts/retime-from-transcript.mjs mots.json
 */
import { body, createTimeline, impact, serif } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // Lundi matin
  { id: "lundi", at: 0, parts: [body("C'est lundi.")] },
  { id: "cours", at: 1.1, parts: [impact("T'AS COURS.")] },
  {
    id: "toujoursPas",
    at: 2.3,
    parts: [body("Et t'as toujours pas eu"), impact("LE JETON PIRATE.", 1.2)],
  },
  // Le blocus
  { id: "ecoute", at: 5.3, parts: [body("Alors écoute-moi bien :")] },
  {
    id: "blocus",
    at: 6.7,
    parts: [body("ce soir, en rentrant, tu fais"), impact("UN BLOCUS.", 1.4)],
  },
  { id: "maths", at: 9.4, parts: [serif("Pas pour les maths.")] },
  { id: "pourJeton", at: 10.6, parts: [impact("POUR LE JETON.")] },
  // L'échéance
  {
    id: "dec5",
    at: 12.0,
    parts: [body("Le 5 décembre,"), body("il disparaît.", 1.0)],
  },
  {
    id: "semaines",
    at: 14.2,
    parts: [body("Il reste"), impact("MOINS DE 3 SEMAINES.", 0.6)],
  },
  { id: "chaqueSoir", at: 16.6, parts: [body("Chaque soir où tu lâches,")] },
  { id: "chance", at: 18.2, parts: [impact("UNE CHANCE EN MOINS.")] },
  // Mardi
  { id: "fatigue", at: 20.0, parts: [serif("Oui, demain tu seras fatigué.")] },
  {
    id: "prof",
    at: 22.2,
    parts: [serif("Oui, ton prof va te regarder bizarrement.")],
  },
  { id: "dixAns", at: 25.0, parts: [body("Mais dans 10 ans,")] },
  {
    id: "personne",
    at: 26.4,
    end: 29.0,
    parts: [body("personne ne se souviendra"), impact("DE CE MARDI.", 1.2)],
  },
  // L'appel
  { id: "rappelle", at: 29.1, parts: [impact("RAPPELLE TON ÉQUIPE.")] },
  { id: "console", at: 30.7, parts: [impact("ALLUME LA CONSOLE.")] },
  { id: "coffre", at: 32.2, parts: [impact("OUVRE CHAQUE COFFRE.")] },
  {
    id: "partie",
    at: 33.9,
    parts: [body("Ce soir, ce n'est pas une partie.")],
  },
  { id: "cestBlocus", at: 35.9, parts: [impact("C'EST UN BLOCUS.")] },
  // Le lendemain
  {
    id: "quandMeme",
    at: 37.7,
    parts: [serif("Et demain, tu vas en cours quand même.")],
  },
  {
    id: "avecJeton",
    at: 40.1,
    end: 44,
    parts: [body("Mais peut-être…"), impact("AVEC LE JETON.", 0.9)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 45;

export const timeline5 = createTimeline(cues, TOTAL_SECONDS);
