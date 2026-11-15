/**
 * Conducteur de la vidéo : chaque réplique du texte, avec son instant
 * d'apparition (en secondes).
 *
 * C'est la seule table à modifier pour recaler la vidéo sur une voix off :
 * les scènes et les bruitages lisent leurs instants ici, par identifiant.
 *
 * Styles :
 * - "body"   : sous-titre courant ;
 * - "impact" : mot-choc en capitales ;
 * - "serif"  : aparté en italique.
 * Dans un texte "body", les mots entre astérisques passent en italique
 * (ex. « C'est *peut-être lui* »).
 */
import { body, createTimeline, impact, serif } from "./lib/timelineTools";
import type { Cue } from "./lib/timelineTools";

export type { Cue, CuePart, PartKind } from "./lib/timelineTools";
export { toFrames } from "./lib/timelineTools";

export const cues: Cue[] = [
  // Ouverture
  { id: "dec5", at: 0, parts: [body("Le 5 décembre,")] },
  { id: "jetonPirate", at: 0.94, parts: [body("le jeton pirate")] },
  { id: "disparait", at: 2.21, end: 3.46, parts: [impact("DISPARAÎT.")] },
  { id: "etToi", at: 3.51, parts: [body("Et toi,")] },
  {
    id: "abandonne",
    at: 4.53,
    parts: [body("tu as"), impact("ABANDONNÉ.", 0.4)],
  },
  { id: "reprends", at: 5.92, parts: [body("Reprends.")] },
  { id: "manette", at: 6.66, parts: [body("Reprends ta manette.")] },
  { id: "ordre", at: 7.83, parts: [body("C'est"), impact("UN ORDRE.", 0.47)] },
  // Les potes
  { id: "potes", at: 9.13, parts: [body("Tes potes aussi")] },
  { id: "ontAbandonne", at: 9.87, parts: [body("ont abandonné.")] },
  { id: "rappelle", at: 10.83, end: 11.68, parts: [impact("RAPPELLE-LES.")] },
  { id: "unSeul", at: 11.73, parts: [body("Si un seul de vous")] },
  { id: "trouve", at: 12.68, parts: [body("trouve le jeton,")] },
  {
    id: "toute",
    at: 13.44,
    end: 14.98,
    parts: [impact("TOUTE"), impact("L'ÉQUIPE L'A.", 0.19)],
  },
  // Celui qui ne répond pas
  { id: "ilYenA", at: 15.03, parts: [body("Il y en a un")] },
  { id: "repondra", at: 15.71, parts: [body("qui ne répondra pas.")] },
  { id: "lequel", at: 16.94, parts: [serif("Tu sais déjà lequel.")] },
  { id: "insiste", at: 18.25, parts: [impact("INSISTE.")] },
  { id: "peutEtre", at: 19.12, parts: [body("C'est *peut-être lui*")] },
  { id: "trouvera", at: 19.82, end: 21.05, parts: [body("qui le trouvera.")] },
  // Trois semaines
  { id: "probleme1", at: 21.11, parts: [body("Le problème,")] },
  { id: "reste", at: 21.93, parts: [body("c'est qu'il vous reste")] },
  {
    id: "troisSemaines",
    at: 22.94,
    end: 23.78,
    parts: [impact("TROIS"), impact("SEMAINES.", 0.17)],
  },
  { id: "joues", at: 23.83, parts: [body("Tu ne joues plus.")] },
  {
    id: "service",
    at: 24.83,
    end: 26.07,
    parts: [body("Tu es"), impact("EN SERVICE.", 0.38)],
  },
  // Jour et nuit
  { id: "couches", at: 26.12, parts: [body("Tu te couches")] },
  { id: "pensant1", at: 26.66, parts: [body("en pensant au jeton.")] },
  { id: "leves", at: 28.04, parts: [body("Tu te lèves")] },
  {
    id: "pensant2",
    at: 28.6,
    end: 30.14,
    parts: [body("en pensant au jeton.")],
  },
  { id: "entreDeux", at: 30.19, parts: [body("Entre les deux,")] },
  { id: "coffres", at: 31.07, parts: [body("tu ouvres des coffres.")] },
  // Les chiffres
  {
    id: "total",
    at: 32.33,
    parts: [impact("137 500"), impact("COFFRES.", 1.71)],
  },
  { id: "caFait", at: 34.63, parts: [body("Ça fait")] },
  {
    id: "parJour",
    at: 35.06,
    end: 36.62,
    parts: [impact("6 500"), impact("PAR JOUR.", 0.86)],
  },
  { id: "quarante", at: 36.67, parts: [body("Tu en ouvres 40,")] },
  { id: "cinquante", at: 37.95, parts: [body("parfois 50.")] },
  { id: "faisMieux", at: 39.09, end: 39.96, parts: [impact("FAIS MIEUX.")] },
  // La vraie vie
  { id: "mere", at: 40.01, parts: [body("Ta mère t'appelle")] },
  { id: "manger", at: 40.67, parts: [body("pour manger.")] },
  {
    id: "minutes",
    at: 41.32,
    end: 42.55,
    parts: [body("Tu as"), impact("4 MINUTES.", 0.4)],
  },
  { id: "prof", at: 42.6, parts: [body("Ton prof annonce")] },
  { id: "controle", at: 43.31, parts: [body("un contrôle le 4.")] },
  { id: "demande", at: 44.44, parts: [body("Demande-lui")] },
  { id: "decaler", at: 44.86, parts: [body("de le décaler.")] },
  {
    id: "raisons",
    at: 45.8,
    end: 47.01,
    parts: [impact("RAISONS DE"), impact("SERVICE.", 0.57)],
  },
  { id: "bienSur", at: 47.06, parts: [serif("Bien sûr,")] },
  { id: "reviser", at: 47.44, parts: [body("tu peux aussi réviser.")] },
  { id: "bac", at: 49.11, parts: [body("Mais le bac")] },
  { id: "chaqueAnnee", at: 49.76, parts: [body("revient chaque année.")] },
  {
    id: "non",
    at: 50.74,
    end: 52.3,
    parts: [body("Le jeton,"), impact("NON.", 0.83)],
  },
  // Le compte à rebours
  { id: "probleme2", at: 52.35, parts: [body("Le problème,")] },
  { id: "jours", at: 53.17, parts: [body("c'est que les jours")] },
  { id: "partent", at: 54.14, parts: [body("partent plus vite")] },
  { id: "queCoffres", at: 54.71, parts: [body("que les coffres.")] },
  { id: "deuxSemaines", at: 55.62, parts: [body("Deux semaines.")] },
  { id: "rien", at: 56.6, parts: [impact("RIEN.")] },
  { id: "uneSemaine", at: 57.29, parts: [body("Une semaine.")] },
  { id: "bandage", at: 58.31, parts: [serif("Un bandage.")] },
  { id: "troisJours", at: 59.29, parts: [body("Trois jours.")] },
  {
    id: "toujoursRien",
    at: 60.23,
    end: 61.17,
    parts: [impact("TOUJOURS"), impact("RIEN.", 0.42)],
  },
  { id: "personne", at: 61.22, parts: [body("Personne ne quitte")] },
  { id: "equipe", at: 61.98, end: 62.97, parts: [impact("L'ÉQUIPE.")] },
  // Le dernier soir
  { id: "dec4", at: 63.02, parts: [body("Le 4 décembre.")] },
  { id: "heures", at: 64.42, parts: [body("23 heures.")] },
  { id: "touteEquipe", at: 65.53, parts: [body("Toute l'équipe")] },
  { id: "connectee", at: 66.18, parts: [body("est connectée.")] },
  { id: "memeCelui", at: 66.99, parts: [body("Même celui")] },
  { id: "repondait", at: 67.45, parts: [body("qui ne répondait pas.")] },
  { id: "coffreBrille", at: 68.82, parts: [body("Un coffre brille")] },
  { id: "bordEau", at: 69.37, parts: [body("au bord de l'eau.")] },
  { id: "ouvres", at: 70.65, parts: [body("Tu l'ouvres.")] },
  {
    id: "estLa",
    at: 71.51,
    parts: [impact("LE JETON"), impact("EST LÀ.", 0.53)],
  },
  {
    id: "pourToute",
    at: 72.65,
    end: 73.9,
    parts: [body("Pour toute l'équipe.")],
  },
  // Final
  { id: "dec5Fin", at: 73.95, parts: [body("Le 5 décembre,")] },
  { id: "disparaitFin", at: 74.97, parts: [body("le jeton disparaît…")] },
  { id: "saufCeux", at: 76.77, parts: [body("sauf pour ceux")] },
  {
    id: "pasAbandonne",
    at: 77.37,
    end: 81,
    parts: [body("qui n'ont pas"), impact("ABANDONNÉ.", 0.79)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 82;

export const timeline1 = createTimeline(cues, TOTAL_SECONDS);
export const TOTAL_FRAMES = timeline1.totalFrames;
export const cueAt = timeline1.cueAt;
export const cuePartAt = timeline1.cuePartAt;
