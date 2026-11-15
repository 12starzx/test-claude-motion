/**
 * Conducteur de la vidéo 3 (« ceux qui restent ») : message de motivation à
 * ceux qui ont abandonné. Mêmes conventions que src/timeline.ts.
 *
 * Recalage sur la voix :
 *   TIMELINE=src/v3/timeline.ts node scripts/retime-from-transcript.mjs mots.json
 */
import { body, createTimeline, impact, serif } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // Ceux qui ont lâché
  {
    id: "abandonne",
    at: 0,
    parts: [
      body("Tu as"),
      impact("ABANDONNÉ", 0.31),
      body("le jeton pirate.", 0.89),
    ],
  },
  { id: "commeTous", at: 2.17, parts: [body("Comme presque tout le monde.")] },
  { id: "vides", at: 3.85, parts: [body("Trop de coffres vides.")] },
  { id: "soirees", at: 5.18, parts: [body("Trop de soirées pour rien.")] },
  { id: "dit", at: 6.55, parts: [body("Tu t'es dit :")] },
  { id: "chance", at: 7.27, parts: [serif("« C'est de la chance,")] },
  {
    id: "pasPourMoi",
    at: 8.18,
    end: 9.38,
    parts: [serif("c'est pas pour moi. »")],
  },
  // Le renversement
  { id: "ecoute", at: 9.43, parts: [impact("ÉCOUTE-MOI BIEN.")] },
  {
    id: "forts",
    at: 10.55,
    parts: [body("Le jeton ne récompense pas les plus forts.")],
  },
  {
    id: "restent",
    at: 12.74,
    end: 14.52,
    parts: [body("Il récompense"), impact("CEUX QUI RESTENT.", 0.89)],
  },
  {
    id: "lachent",
    at: 14.57,
    parts: [body("Pendant que les autres lâchent,")],
  },
  {
    id: "revenir",
    at: 15.99,
    parts: [body("toi,"), impact("TU PEUX REVENIR.", 0.51)],
  },
  {
    id: "chaqueSoir",
    at: 17.65,
    parts: [body("Et chaque soir où tu reviens,")],
  },
  {
    id: "rapproches",
    at: 19.15,
    end: 20.2,
    parts: [impact("TU TE RAPPROCHES.")],
  },
  // Le plan
  { id: "nuit", at: 20.25, parts: [body("Pas besoin d'y passer la nuit.")] },
  {
    id: "trente1",
    at: 21.64,
    parts: [impact("30 MINUTES"), body("ce soir.", 0.62)],
  },
  {
    id: "trente2",
    at: 22.89,
    parts: [impact("30 MINUTES"), body("demain.", 0.49)],
  },
  { id: "avecEquipe", at: 24.01, parts: [body("Avec ton équipe.")] },
  { id: "unSeul", at: 25.13, parts: [body("Un seul d'entre vous le trouve,")] },
  {
    id: "touteEquipe",
    at: 26.68,
    end: 27.91,
    parts: [body("et"), impact("TOUTE L'ÉQUIPE", 0.14), body("l'a.", 0.85)],
  },
  // Le futur sombre
  { id: "imagine", at: 27.96, parts: [body("Imagine le 5 décembre.")] },
  { id: "disparait", at: 29.61, parts: [body("Le jeton disparaît.")] },
  { id: "potes", at: 30.84, parts: [body("Tes potes l'ont…")] },
  {
    id: "regardes",
    at: 31.77,
    end: 33.48,
    parts: [body("et toi,"), impact("TU REGARDES.", 0.73)],
  },
  // L'autre version
  { id: "ouAlors", at: 33.53, parts: [body("Ou alors,")] },
  { id: "autreVersion", at: 34.45, parts: [serif("imagine l'autre version.")] },
  {
    id: "dec4",
    at: 36.03,
    parts: [body("Le 4 décembre,"), body("tard.", 1.29)],
  },
  { id: "unDePlus", at: 38.01, parts: [body("Un coffre de plus.")] },
  { id: "dernier", at: 39.29, parts: [body("Le dernier de la soirée.")] },
  { id: "ouvres", at: 40.63, parts: [body("Tu l'ouvres…")] },
  {
    id: "estLa",
    at: 41.51,
    end: 42.7,
    parts: [body("et"), impact("IL EST LÀ.", 0.17)],
  },
  // L'appel
  { id: "relance", at: 42.82, parts: [impact("RELANCE LE JEU.")] },
  { id: "rappelle", at: 43.72, parts: [impact("RAPPELLE TON ÉQUIPE.")] },
  {
    id: "attendPas",
    at: 44.95,
    end: 46.95,
    parts: [body("Le 5 décembre"), impact("N'ATTEND PERSONNE.", 0.82)],
  },
  // Le choix
  {
    id: "regardent",
    at: 47,
    parts: [body("Ceux qui abandonnent"), impact("REGARDENT.", 1.05)],
  },
  {
    id: "gagnent",
    at: 48.67,
    parts: [body("Ceux qui restent"), impact("LE GAGNENT.", 0.99)],
  },
  {
    id: "choisis",
    at: 50.47,
    end: 54,
    parts: [body("Toi,"), impact("TU CHOISIS QUOI ?", 0.53)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 55;

export const timeline3 = createTimeline(cues, TOTAL_SECONDS);
