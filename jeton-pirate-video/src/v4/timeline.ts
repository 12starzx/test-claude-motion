/**
 * Conducteur de la vidéo 4 (« GTA 6 : treize ans ») : treize ans d'attente,
 * deux reports, et la leçon de persévérance. Mêmes conventions que
 * src/timeline.ts.
 *
 * Calage : chaque réplique démarre sur une reprise réelle de la voix
 * (pauses mesurées avec ffmpeg silencedetect, vérifiées une à une).
 */
import { body, createTimeline, impact, serif } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const cues: Cue[] = [
  // 2013
  { id: "sept2013", at: 0, parts: [body("Le 17 septembre 2013,")] },
  { id: "gta5", at: 2.04, parts: [impact("GTA 5 SORT.")] },
  { id: "tuTeDis", at: 3.71, parts: [body("Tu te dis :")] },
  {
    id: "prochain",
    at: 4.58,
    end: 6.9,
    parts: [serif("le prochain,"), serif("ce sera dans 3 ou 4 ans.", 0.75)],
  },
  // Treize ans
  { id: "treize", at: 6.95, parts: [body("13 ans plus tard…")] },
  {
    id: "attends",
    at: 8.05,
    end: 9.6,
    parts: [impact("TU ATTENDS"), impact("TOUJOURS.", 0.35)],
  },
  // Le premier trailer
  { id: "dec2023", at: 9.67, parts: [body("Décembre 2023 :")] },
  { id: "trailer1", at: 11.32, parts: [impact("PREMIER TRAILER.")] },
  {
    id: "vues90",
    at: 12.5,
    end: 15.15,
    parts: [impact("90 MILLIONS"), body("de vues en 24 heures.", 1.3)],
  },
  { id: "croit", at: 15.21, parts: [body("Tout le monde y croit :")] },
  {
    id: "sortie2025",
    at: 16.2,
    end: 18.15,
    parts: [body("sortie en"), impact("2025.", 0.55)],
  },
  // Les reports
  { id: "report1", at: 18.2, parts: [body("Puis premier report :")] },
  { id: "mai2026", at: 19.69, end: 21.05, parts: [impact("MAI 2026.")] },
  { id: "report2", at: 21.12, parts: [body("Puis deuxième report :")] },
  { id: "novembre", at: 22.75, end: 23.65, parts: [impact("NOVEMBRE.")] },
  {
    id: "rockstar",
    at: 23.7,
    end: 26.85,
    parts: [
      body("Rockstar préfère attendre"),
      body("plutôt que sortir un jeu pas fini.", 1.3),
    ],
  },
  { id: "deuxReports", at: 26.93, parts: [impact("DEUX REPORTS.")] },
  { id: "treizeAns", at: 28.02, parts: [impact("13 ANS.")] },
  {
    id: "zero",
    at: 28.81,
    end: 30.15,
    parts: [impact("ZÉRO"), impact("RACCOURCI.", 0.3)],
  },
  // Le deuxième trailer
  { id: "mai2025", at: 30.22, parts: [body("Mai 2025 :")] },
  { id: "trailer2", at: 31.5, parts: [impact("DEUXIÈME TRAILER.")] },
  {
    id: "vues475",
    at: 32.79,
    end: 35.78,
    parts: [impact("475 MILLIONS"), body("de vues en un jour.", 1.65)],
  },
  {
    id: "monde",
    at: 35.84,
    end: 38.3,
    parts: [body("Le monde entier regarde"), impact("VICE CITY.", 1.3)],
  },
  // Et toi ?
  { id: "etToi", at: 38.38, parts: [body("Et toi,")] },
  { id: "pendant", at: 39.15, parts: [body("pendant ces 13 ans,")] },
  { id: "attendu", at: 40.39, parts: [serif("tu as attendu…")] },
  {
    id: "avance",
    at: 41.54,
    end: 42.72,
    parts: [impact("OU TU AS"), impact("AVANCÉ ?", 0.3)],
  },
  // La leçon
  {
    id: "lecon",
    at: 42.78,
    parts: [body("Parce que la vraie leçon est là :")],
  },
  {
    id: "grand",
    at: 44.48,
    end: 46.3,
    parts: [body("ce qui est grand"), impact("PREND DU TEMPS.", 0.97)],
  },
  {
    id: "tiennent",
    at: 46.37,
    parts: [body("Et ceux qui tiennent jusqu'au bout")],
  },
  {
    id: "arriver",
    at: 47.88,
    end: 49.7,
    parts: [body("finissent toujours"), impact("PAR ARRIVER.", 0.8)],
  },
  // Le 19 novembre
  {
    id: "jeudi",
    at: 49.75,
    parts: [impact("JEUDI"), impact("19 NOVEMBRE.", 0.45)],
  },
  {
    id: "leonida",
    at: 51.32,
    parts: [body("Leonida"), impact("OUVRE SES PORTES.", 0.5)],
  },
  {
    id: "jason",
    at: 53.13,
    end: 54.8,
    parts: [body("Jason et Lucia sont prêts.")],
  },
  { id: "attente", at: 54.85, parts: [impact("13 ANS D'ATTENTE.")] },
  {
    id: "jours",
    at: 56.15,
    end: 59.5,
    parts: [body("Plus que"), impact("QUELQUES JOURS.", 0.45)],
  },
];

/** Durée totale (s) : la dernière réplique, puis un fondu au noir. */
export const TOTAL_SECONDS = 60.5;

export const timeline4 = createTimeline(cues, TOTAL_SECONDS);
