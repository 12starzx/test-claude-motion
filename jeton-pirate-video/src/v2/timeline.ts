/**
 * Conducteur de la vidéo 2 (« Le jeton pirate · la mission ») : nouveau texte,
 * même univers. Mêmes conventions que src/timeline.ts.
 *
 * Recalage sur la voix :
 *   TIMELINE=src/v2/timeline.ts node scripts/retime-from-transcript.mjs mots.json
 */
import { body, createTimeline, impact, serif } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // Ouverture
  { id: "dec5", at: 0, parts: [body("Le 5 décembre,")] },
  { id: "disparait", at: 0.9, parts: [body("le jeton pirate disparaît.")] },
  { id: "toujours", at: 3, end: 4.33, parts: [impact("POUR TOUJOURS.")] },
  // Et toi ?
  { id: "etToi", at: 4.38, parts: [body("Et toi,")] },
  { id: "quoi", at: 4.88, parts: [body("tu comptes faire quoi ?")] },
  { id: "regarder", at: 6.19, parts: [serif("Regarder ?")] },
  { id: "non", at: 7.08, parts: [impact("NON.")] },
  { id: "ceSoir", at: 7.57, parts: [body("Ce soir,")] },
  { id: "partie", at: 8.08, parts: [body("tu ne lances pas une partie.")] },
  {
    id: "mission",
    at: 9.97,
    end: 11.41,
    parts: [body("Tu lances"), impact("UNE MISSION.", 0.45)],
  },
  // L'équipe
  { id: "reveille", at: 11.46, parts: [body("Réveille ton équipe.")] },
  { id: "toutLeMonde", at: 12.58, parts: [impact("TOUT LE MONDE.")] },
  { id: "memeCelui", at: 13.16, parts: [body("Même celui qui jure")] },
  { id: "arrete", at: 14.13, parts: [body("qu'il a *arrêté.*")] },
  { id: "unSeul", at: 15.48, parts: [body("Il suffit qu'un seul")] },
  { id: "trouve", at: 16.67, parts: [body("d'entre vous le trouve,")] },
  {
    id: "equipe",
    at: 17.78,
    end: 19.45,
    parts: [
      body("et"),
      impact("TOUTE L'ÉQUIPE", 0.14),
      body("repart avec.", 0.72),
    ],
  },
  // Le plan
  { id: "plan", at: 19.5, parts: [body("Le plan est simple.")] },
  { id: "ile", at: 20.69, parts: [impact("CHAQUE ÎLE.")] },
  { id: "epave", at: 21.51, parts: [impact("CHAQUE ÉPAVE.")] },
  { id: "coffre", at: 22.52, end: 23.67, parts: [impact("CHAQUE COFFRE.")] },
  // Les nuits
  {
    id: "soir1",
    at: 23.72,
    parts: [body("Premier soir :"), impact("RIEN.", 0.97)],
  },
  {
    id: "soir2",
    at: 25.29,
    parts: [body("Deuxième soir :"), body("des munitions.", 0.61)],
  },
  {
    id: "soir3",
    at: 27.21,
    parts: [body("Troisième soir :"), body("un poisson.", 0.67)],
  },
  { id: "poisson", at: 29.16, end: 30.37, parts: [impact("UN POISSON.")] },
  { id: "doute", at: 30.42, parts: [body("Tes potes commencent à douter.")] },
  {
    id: "jamais",
    at: 32.04,
    end: 33.43,
    parts: [body("Toi,"), impact("JAMAIS.", 0.59)],
  },
  // La nuit blanche
  { id: "tel", at: 33.48, parts: [body("Ton téléphone affiche 2 h 47.")] },
  {
    id: "encore",
    at: 35.82,
    end: 37.57,
    parts: [body("Tu te dis :"), impact("ENCORE UNE.", 0.61)],
  },
  { id: "attendre", at: 37.62, parts: [body("Tout le reste peut attendre.")] },
  {
    id: "dec5b",
    at: 39.06,
    end: 41.68,
    parts: [body("Le 5 décembre, lui,"), impact("N'ATTENDRA PAS.", 1.6)],
  },
  // Le compte à rebours
  {
    id: "troisJours",
    at: 41.73,
    parts: [body("Plus que"), impact("3 JOURS.", 0.46)],
  },
  { id: "deux", at: 42.96, parts: [impact("PUIS 2.")] },
  { id: "un", at: 43.77, end: 44.56, parts: [impact("PUIS 1.")] },
  // Le dernier soir
  { id: "dec4", at: 44.75, parts: [body("Le 4 décembre.")] },
  { id: "heure", at: 46.04, parts: [impact("23:58")] },
  { id: "vocal", at: 47.72, parts: [body("Toute l'équipe est en vocal.")] },
  {
    id: "silence",
    at: 49.24,
    end: 50.72,
    parts: [serif("Plus personne ne parle.")],
  },
  { id: "phare", at: 50.77, parts: [body("Un coffre brille sous le phare.")] },
  { id: "approches", at: 52.61, parts: [body("Tu t'approches.")] },
  { id: "ouvres", at: 53.61, parts: [body("Tu l'ouvres.")] },
  // Le jeton
  { id: "estLa", at: 54.44, parts: [impact("IL EST LÀ.")] },
  { id: "leJeton", at: 55.21, parts: [body("Le jeton.")] },
  { id: "pourToi", at: 56.12, parts: [body("Pour toi.")] },
  { id: "pourEux", at: 56.86, parts: [body("Pour eux.")] },
  {
    id: "pourEquipe",
    at: 57.51,
    end: 58.78,
    parts: [body("Pour"), impact("TOUTE L'ÉQUIPE.", 0.19)],
  },
  // Final
  { id: "dec5Fin", at: 58.83, parts: [body("Le 5 décembre,")] },
  { id: "disparaitFin", at: 59.8, parts: [body("le jeton disparaît…")] },
  {
    id: "casier",
    at: 61.63,
    end: 65,
    parts: [body("mais"), impact("PAS DE VOTRE", 0.33), impact("CASIER.", 0.9)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 66;

export const timeline2 = createTimeline(cues, TOTAL_SECONDS);
