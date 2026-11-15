/**
 * Conducteur de la vidéo 5 (« le blocus ») : le jeton disparaît le 5 décembre,
 * alors demain tu bloques le lycée, tu rentres, tu joues toute la journée,
 * et à 23 h 59… il est là. Mêmes conventions que src/timeline.ts.
 *
 * Calage : chaque réplique démarre sur une reprise réelle de la voix
 * (pauses mesurées avec ffmpeg silencedetect, vérifiées une à une).
 */
import { body, createTimeline, impact } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // L'enjeu
  {
    id: "dec5",
    at: 0,
    end: 3.1,
    parts: [
      body("Le 5 décembre,"),
      body("le jeton pirate", 0.9),
      impact("DISPARAÎT.", 2.0),
    ],
  },
  {
    id: "etToi",
    at: 3.15,
    end: 5.25,
    parts: [
      body("Et toi,"),
      body("t'as toujours", 0.75),
      impact("LES MAINS VIDES.", 1.35),
    ],
  },
  // Le blocus
  { id: "cours", at: 5.3, parts: [body("Demain, t'as cours ?")] },
  { id: "blocus", at: 6.51, parts: [impact("FAIS UN BLOCUS.")] },
  {
    id: "revendication",
    at: 7.57,
    parts: [body("Revendication :"), impact("LE JETON.", 0.55)],
  },
  {
    id: "bloque",
    at: 8.73,
    parts: [body("Lycée bloqué,"), body("pas de cours.", 0.97)],
  },
  {
    id: "maison",
    at: 10.67,
    parts: [body("Tu rentres chez toi,"), body("tu lances une partie.", 0.78)],
  },
  // La journée à la maison
  {
    id: "mere",
    at: 13.46,
    parts: [body("Ta mère demande pourquoi t'es déjà là ?")],
  },
  {
    id: "revendications",
    at: 15.22,
    end: 16.3,
    parts: [impact("« REVENDICATIONS. »")],
  },
  { id: "frere", at: 16.33, parts: [body("Ton petit frère veut la télé ?")] },
  {
    id: "vaisselle",
    at: 17.66,
    parts: [body("Une partie contre"), impact("UNE VAISSELLE.", 0.75)],
  },
  { id: "devoirs", at: 19.09, parts: [body("Des devoirs ?")] },
  {
    id: "le6",
    at: 19.94,
    end: 21.0,
    parts: [body("Tu les feras"), impact("LE 6.", 0.55)],
  },
  // L'équipe
  { id: "equipeQ", at: 21.08, parts: [body("Ton équipe ?")] },
  {
    id: "aussi",
    at: 21.91,
    parts: [body("Elle aussi a fait"), impact("LE BLOCUS.", 0.75)],
  },
  {
    id: "vocal",
    at: 23.37,
    parts: [body("Tout le monde"), impact("EN VOCAL.", 0.5)],
  },
  { id: "suffit", at: 24.56, parts: [body("Parce qu'un seul coffre suffit…")] },
  {
    id: "toute",
    at: 26.45,
    end: 27.5,
    parts: [body("et"), impact("TOUTE L'ÉQUIPE L'A.", 0.2)],
  },
  // La journée qui passe
  { id: "midi", at: 27.54, parts: [body("Midi :"), impact("RIEN.", 0.74)] },
  {
    id: "seize",
    at: 28.98,
    parts: [body("Seize heures :"), impact("RIEN.", 0.87)],
  },
  {
    id: "vingtDeux",
    at: 30.52,
    end: 32.5,
    parts: [body("Vingt-deux heures :"), impact("ENCORE RIEN.", 1.02)],
  },
  { id: "h2359", at: 32.58, parts: [impact("23:59")] },
  { id: "dernier", at: 34.41, parts: [body("Un dernier coffre…")] },
  {
    id: "estLa",
    at: 35.78,
    end: 36.7,
    parts: [body("et"), impact("IL EST LÀ.", 0.25)],
  },
  // La boucle
  {
    id: "dec5Fin",
    at: 36.73,
    parts: [body("Le 5 décembre,"), body("le jeton disparaît…", 0.95)],
  },
  {
    id: "sauf",
    at: 39.25,
    end: 43.5,
    parts: [body("sauf pour ceux qui ont fait"), impact("LE BLOCUS.", 1.2)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 44.5;

export const timeline5 = createTimeline(cues, TOTAL_SECONDS);
