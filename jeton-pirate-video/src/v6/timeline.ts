/**
 * Conducteur de la vidéo 6 (« la chance ») : ton pote a eu le jeton, il dit
 * « la chance »… alors tu en fais toujours un peu plus que lui, trois soirs de
 * suite, jusqu'au coffre d'une heure douze. Mêmes conventions que src/timeline.ts.
 *
 * Calage : chaque réplique démarre sur une reprise réelle de la voix (pauses
 * mesurées avec ffmpeg silencedetect, mots répétés vérifiés par comparaison
 * acoustique : « Toi », « rien », « soir », « la chance »).
 */
import { body, createTimeline, impact, serif } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // L'accroche
  {
    id: "pote",
    at: 0,
    parts: [
      body("Ton meilleur pote a eu"),
      impact("LE JETON PIRATE", 0.95),
      body("hier soir.", 1.68),
    ],
  },
  {
    id: "toi",
    at: 2.56,
    parts: [body("Toi,"), body("t'as eu quoi ?", 0.5)],
  },
  { id: "champi", at: 3.76, parts: [impact("DES CHAMPIGNONS.")] },
  // L'enjeu
  {
    id: "dec5",
    at: 4.85,
    parts: [body("Et le 5 décembre,"), impact("IL DISPARAÎT.", 1.11)],
  },
  { id: "toujours", at: 7.05, end: 8.1, parts: [serif("Pour toujours.")] },
  // Le déclic
  {
    id: "demande",
    at: 8.2,
    parts: [body("Tu lui demandes comment il a fait.")],
  },
  {
    id: "repond",
    at: 9.79,
    parts: [body("Il répond :"), serif("« La chance. »", 0.97)],
  },
  { id: "faux", at: 11.69, end: 12.45, parts: [impact("FAUX.")] },
  // L'escalade
  { id: "joue", at: 12.49, parts: [body("Il a joué jusqu'à 2 h ?")] },
  {
    id: "toi1",
    at: 13.97,
    parts: [body("Toi,"), impact("2 H ET UNE MINUTE.", 0.58)],
  },
  { id: "coffres", at: 16.11, parts: [body("Il a ouvert 300 coffres ?")] },
  {
    id: "toi2",
    at: 17.61,
    parts: [body("Toi,"), impact("301.", 0.62)],
  },
  {
    id: "nord",
    at: 19.17,
    parts: [body("Il a fouillé le nord de l'île ?")],
  },
  {
    id: "toi3",
    at: 20.65,
    end: 23.0,
    parts: [body("Toi,"), body("le sud…", 0.53), impact("PUIS LE NORD.", 1.43)],
  },
  // La galère
  {
    id: "soir1",
    at: 23.1,
    parts: [body("Premier soir :"), impact("RIEN.", 1.02)],
  },
  {
    id: "soir2",
    at: 24.68,
    parts: [body("Deuxième soir :"), impact("RIEN.", 1.12)],
  },
  {
    id: "capture",
    at: 26.44,
    parts: [body("Il t'envoie une capture de *son* jeton.")],
  },
  {
    id: "ferme",
    at: 28.33,
    end: 30.6,
    parts: [body("Tu fermes l'appli…"), impact("ET TU RELANCES.", 1.3)],
  },
  // La récompense
  { id: "soir3", at: 30.71, parts: [serif("Troisième soir.")] },
  { id: "h112", at: 32.01, parts: [impact("1 H 12.")] },
  {
    id: "dernier",
    at: 33.13,
    end: 34.7,
    parts: [body("Dernier coffre de la nuit…"), impact("ET IL EST LÀ.", 0.81)],
  },
  // La boucle
  {
    id: "lendemain",
    at: 34.81,
    parts: [
      body("Le lendemain,"),
      body("ton pote te demande", 0.97),
      body("comment t'as fait.", 2.47),
    ],
  },
  {
    id: "reponds",
    at: 38.2,
    parts: [body("Tu réponds :"), impact("« LA CHANCE. »", 1.01)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 41.8;

export const timeline6 = createTimeline(cues, TOTAL_SECONDS);
