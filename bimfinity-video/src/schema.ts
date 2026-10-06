/**
 * Props éditables de la vidéo (textes et libellés).
 *
 * Le schéma Zod est branché sur les deux compositions : dans Remotion Studio
 * (npm run dev), le panneau « Props » permet de modifier chaque texte sans
 * toucher au code, avec validation en direct.
 *
 * Convention : le mot clé d'un titre s'écrit entre astérisques, *ainsi*,
 * et s'affiche en bleu. La typographie française (espaces insécables avant
 * : ; ! ?, guillemets « », apostrophe typographique) est appliquée
 * automatiquement au rendu : il suffit de saisir des espaces normales.
 */
import { z } from "zod";

/** Garde-fou éditorial : la valeur se montre, elle ne se promet pas en chiffres. */
const NO_FIGURES = /[0-9%€$£]/;
/** Garde-fou typographique : pas de tiret cadratin. */
const EM_DASH = /\u2014/;

const screenText = (description: string) =>
  z
    .string()
    .min(1, "Ce texte ne peut pas être vide.")
    .refine((value) => !NO_FIGURES.test(value), {
      message:
        "Aucun chiffre à l'écran : la valeur se montre, elle ne se promet pas en chiffres.",
    })
    .refine((value) => !EM_DASH.test(value), {
      message: "Pas de tiret cadratin : préférer une virgule ou un retour à la ligne.",
    })
    .describe(description);

export const benefitIconSchema = z.enum(["shield", "gauge", "trend"]);
export type BenefitIcon = z.infer<typeof benefitIconSchema>;

export const bimfinitySchema = z.object({
  console: z.object({
    label: screenText("Micro-libellé au-dessus de la barre de saisie"),
    query: screenText("Question tapée caractère par caractère (scène 2)"),
  }),
  processing: z.object({
    sources: z
      .array(screenText("Source de données"))
      .min(3)
      .max(6)
      .describe("Flux de données qui convergent vers la console (scène 3)"),
    subtitle: screenText(
      "Sous-titre lumineux ; les mots séparés par « · » apparaissent un à un",
    ),
  }),
  reveal: z.object({
    recommendation: screenText("Carte principale de la décision (scène 4)"),
    benefits: z
      .array(
        z.object({
          text: screenText("Bénéfice"),
          icon: benefitIconSchema,
        }),
      )
      .length(3)
      .describe("Trois cartes secondaires"),
  }),
  value: z.object({
    title: screenText(
      "Titre plein cadre (scène 5) ; une ligne par segment séparé par une virgule",
    ),
  }),
  outro: z.object({
    brandName: screenText("Nom de marque (logo de remplacement, texte alternatif)"),
    logoIncludesName: z
      .boolean()
      .describe("Le fichier logo.svg contient-il déjà le nom ? Sinon, le nom est ajouté à côté."),
    tagline: screenText("Positionnement"),
    baseline: screenText("Signature"),
    poweredBy: screenText("Mention discrète"),
  }),
});

export type BimfinityProps = z.infer<typeof bimfinitySchema>;

/** Textes définitifs (storyboard validé). */
export const defaultBimfinityProps: BimfinityProps = {
  console: {
    label: "BIMfinity · copilote de décision",
    query: "Dois-je céder, rénover ou conserver cet actif ?",
  },
  processing: {
    sources: ["BIM", "Énergie", "Réglementation", "Coûts", "Finance"],
    subtitle: "Centralise · Analyse · Arbitre",
  },
  reveal: {
    recommendation: "Recommandation : *rénover en deux phases*",
    benefits: [
      { text: "Conformité OPERAT sécurisée", icon: "shield" },
      { text: "CAPEX maîtrisé", icon: "gauge" },
      { text: "Valeur de l'actif défendue", icon: "trend" },
    ],
  },
  value: {
    title: "*Décider* plus vite, investir mieux, prouver la valeur.",
  },
  outro: {
    brandName: "BIMfinity",
    logoIncludesName: true,
    tagline: "Le copilote de *décision* du tertiaire.",
    baseline: "Chaque mètre carré, une décision.",
    poweredBy: "Propulsé par HB Engineering",
  },
};
