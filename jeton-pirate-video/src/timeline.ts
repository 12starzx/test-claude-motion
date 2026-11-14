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
import { VIDEO } from "./theme";

export type PartKind = "body" | "impact" | "serif";

export type CuePart = {
  text: string;
  kind?: PartKind;
  /** Décalage (s) entre le début de la réplique et l'apparition de la ligne. */
  delay?: number;
};

export type Cue = {
  id: string;
  /** Apparition (s). */
  at: number;
  /** Disparition (s). Par défaut : apparition de la réplique suivante. */
  end?: number;
  parts: CuePart[];
};

const body = (text: string, delay = 0): CuePart => ({ text, delay });
const impact = (text: string, delay = 0): CuePart => ({
  text,
  kind: "impact",
  delay,
});
const serif = (text: string, delay = 0): CuePart => ({
  text,
  kind: "serif",
  delay,
});

export const cues: Cue[] = [
  // Ouverture
  { id: "dec5", at: 0.4, parts: [body("Le 5 décembre,")] },
  { id: "jetonPirate", at: 1.3, parts: [body("le jeton pirate")] },
  { id: "disparait", at: 1.9, end: 2.8, parts: [impact("DISPARAÎT.")] },
  { id: "etToi", at: 2.9, parts: [body("Et toi,")] },
  {
    id: "abandonne",
    at: 3.4,
    parts: [body("tu as"), impact("ABANDONNÉ.", 0.45)],
  },
  { id: "reprends", at: 4.4, parts: [body("Reprends.")] },
  { id: "manette", at: 4.9, parts: [body("Reprends ta manette.")] },
  { id: "ordre", at: 5.5, parts: [body("C'est"), impact("UN ORDRE.", 0.4)] },
  // Les potes
  { id: "potes", at: 6.4, parts: [body("Tes potes aussi")] },
  { id: "ontAbandonne", at: 7.35, parts: [body("ont abandonné.")] },
  { id: "rappelle", at: 7.9, end: 8.8, parts: [impact("RAPPELLE-LES.")] },
  { id: "unSeul", at: 8.9, parts: [body("Si un seul de vous")] },
  { id: "trouve", at: 9.9, parts: [body("trouve le jeton,")] },
  {
    id: "toute",
    at: 10.4,
    end: 11.3,
    parts: [impact("TOUTE"), impact("L'ÉQUIPE L'A.", 0.3)],
  },
  // Celui qui ne répond pas
  { id: "ilYenA", at: 11.4, parts: [body("Il y en a un")] },
  { id: "repondra", at: 12.4, parts: [body("qui ne répondra pas.")] },
  { id: "lequel", at: 13.4, parts: [serif("Tu sais déjà lequel.")] },
  { id: "insiste", at: 14.4, parts: [impact("INSISTE.")] },
  { id: "peutEtre", at: 14.95, parts: [body("C'est *peut-être lui*")] },
  { id: "trouvera", at: 15.9, end: 16.8, parts: [body("qui le trouvera.")] },
  // Trois semaines
  { id: "probleme1", at: 16.9, parts: [body("Le problème,")] },
  { id: "reste", at: 17.4, parts: [body("c'est qu'il vous reste")] },
  {
    id: "troisSemaines",
    at: 18.4,
    end: 18.9,
    parts: [impact("TROIS"), impact("SEMAINES.", 0.15)],
  },
  { id: "joues", at: 18.95, parts: [body("Tu ne joues plus.")] },
  {
    id: "service",
    at: 19.9,
    end: 20.85,
    parts: [body("Tu es"), impact("EN SERVICE.", 0.45)],
  },
  // Jour et nuit
  { id: "couches", at: 20.95, parts: [body("Tu te couches")] },
  { id: "pensant1", at: 21.9, parts: [body("en pensant au jeton.")] },
  { id: "leves", at: 22.95, parts: [body("Tu te lèves")] },
  {
    id: "pensant2",
    at: 23.45,
    end: 24.8,
    parts: [body("en pensant au jeton.")],
  },
  { id: "entreDeux", at: 24.9, parts: [body("Entre les deux,")] },
  { id: "coffres", at: 25.4, parts: [body("tu ouvres des coffres.")] },
  // Les chiffres
  {
    id: "total",
    at: 26.9,
    parts: [impact("137 500"), impact("COFFRES.", 0.5)],
  },
  { id: "caFait", at: 28.4, parts: [body("Ça fait")] },
  {
    id: "parJour",
    at: 28.9,
    end: 29.85,
    parts: [impact("6 500"), impact("PAR JOUR.", 0.45)],
  },
  { id: "quarante", at: 29.95, parts: [body("Tu en ouvres 40,")] },
  { id: "cinquante", at: 30.95, parts: [body("parfois 50.")] },
  { id: "faisMieux", at: 31.9, end: 32.85, parts: [impact("FAIS MIEUX.")] },
  // La vraie vie
  { id: "mere", at: 32.95, parts: [body("Ta mère t'appelle")] },
  { id: "manger", at: 33.45, parts: [body("pour manger.")] },
  {
    id: "minutes",
    at: 34.45,
    end: 35.35,
    parts: [body("Tu as"), impact("4 MINUTES.", 0.3)],
  },
  { id: "prof", at: 35.45, parts: [body("Ton prof annonce")] },
  { id: "controle", at: 35.95, parts: [body("un contrôle le 4.")] },
  { id: "demande", at: 36.95, parts: [body("Demande-lui")] },
  { id: "decaler", at: 37.45, parts: [body("de le décaler.")] },
  {
    id: "raisons",
    at: 38.45,
    end: 39.35,
    parts: [impact("RAISONS DE"), impact("SERVICE.", 0.3)],
  },
  { id: "bienSur", at: 39.45, parts: [serif("Bien sûr,")] },
  { id: "reviser", at: 39.95, parts: [body("tu peux aussi réviser.")] },
  { id: "bac", at: 41.45, parts: [body("Mais le bac")] },
  { id: "chaqueAnnee", at: 41.95, parts: [body("revient chaque année.")] },
  {
    id: "non",
    at: 42.95,
    end: 43.85,
    parts: [body("Le jeton,"), impact("NON.", 0.5)],
  },
  // Le compte à rebours
  { id: "probleme2", at: 43.95, parts: [body("Le problème,")] },
  { id: "jours", at: 44.95, parts: [body("c'est que les jours")] },
  { id: "partent", at: 45.45, parts: [body("partent plus vite")] },
  { id: "queCoffres", at: 46.45, parts: [body("que les coffres.")] },
  { id: "deuxSemaines", at: 46.95, parts: [body("Deux semaines.")] },
  { id: "rien", at: 47.95, parts: [impact("RIEN.")] },
  { id: "uneSemaine", at: 48.45, parts: [body("Une semaine.")] },
  { id: "bandage", at: 49.45, parts: [serif("Un bandage.")] },
  { id: "troisJours", at: 50.45, parts: [body("Trois jours.")] },
  {
    id: "toujoursRien",
    at: 50.95,
    end: 51.85,
    parts: [impact("TOUJOURS"), impact("RIEN.", 0.25)],
  },
  { id: "personne", at: 51.95, parts: [body("Personne ne quitte")] },
  { id: "equipe", at: 52.95, end: 53.35, parts: [impact("L'ÉQUIPE.")] },
  // Le dernier soir
  { id: "dec4", at: 53.45, parts: [body("Le 4 décembre.")] },
  { id: "heures", at: 54.45, parts: [body("23 heures.")] },
  { id: "touteEquipe", at: 55.45, parts: [body("Toute l'équipe")] },
  { id: "connectee", at: 55.95, parts: [body("est connectée.")] },
  { id: "memeCelui", at: 56.95, parts: [body("Même celui")] },
  { id: "repondait", at: 57.45, parts: [body("qui ne répondait pas.")] },
  { id: "coffreBrille", at: 58.45, parts: [body("Un coffre brille")] },
  { id: "bordEau", at: 59.45, parts: [body("au bord de l'eau.")] },
  { id: "ouvres", at: 59.95, parts: [body("Tu l'ouvres.")] },
  {
    id: "estLa",
    at: 60.95,
    parts: [impact("LE JETON"), impact("EST LÀ.", 0.45)],
  },
  {
    id: "pourToute",
    at: 62.45,
    end: 63.35,
    parts: [body("Pour toute l'équipe.")],
  },
  // Final
  { id: "dec5Fin", at: 63.45, parts: [body("Le 5 décembre,")] },
  { id: "disparaitFin", at: 64.45, parts: [body("le jeton disparaît…")] },
  { id: "saufCeux", at: 65.95, parts: [body("sauf pour ceux")] },
  {
    id: "pasAbandonne",
    at: 66.95,
    end: 70,
    parts: [body("qui n'ont pas"), impact("ABANDONNÉ.", 0.35)],
  },
];

export type CueId = (typeof cues)[number]["id"];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 71;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * VIDEO.fps);

const byId = new Map(cues.map((cue) => [cue.id, cue]));

/** Instant (s) d'une réplique. */
export const cueAt = (id: string): number => {
  const cue = byId.get(id);
  if (!cue) {
    throw new Error(`Réplique inconnue : « ${id} »`);
  }
  return cue.at;
};

/** Fin (s) d'une réplique : sa fin explicite, sinon la réplique suivante. */
export const cueEnd = (id: string): number => {
  const index = cues.findIndex((cue) => cue.id === id);
  const cue = cues[index];
  return cue.end ?? cues[index + 1]?.at ?? TOTAL_SECONDS;
};

export const toFrames = (seconds: number): number =>
  Math.round(seconds * VIDEO.fps);
