/**
 * Props éditables de la vidéo (textes et libellés).
 *
 * Le schéma Zod est branché sur les deux compositions : dans Remotion Studio
 * (npm run dev), le panneau « Props » permet de modifier chaque texte sans
 * toucher au code, avec validation en direct. Le même schéma est vérifié au
 * lancement de chaque rendu (CLI, Studio, API) : un texte non conforme
 * interrompt le rendu avec un message explicite.
 *
 * Convention : dans les titres, le mot clé s'écrit entre astérisques, *ainsi*,
 * et s'affiche en bleu. Champs concernés : reveal.recommendation,
 * reveal.benefits[].text, value.title, outro.tagline.
 * La typographie française (espaces insécables avant : ; ! ?, guillemets « »,
 * apostrophe typographique) est appliquée automatiquement au rendu : il suffit
 * de saisir des espaces normales et des guillemets droits.
 */
import type { CalculateMetadataFunction } from "remotion";
import { z } from "zod";

/** Garde-fou éditorial : la valeur se montre, elle ne se promet pas en chiffres. */
const NO_FIGURES = /[0-9%€$£]/;
/** Garde-fou typographique : pas de tiret cadratin. */
const EM_DASH = /—/;

const baseText = (maxLength: number) =>
  z
    .string()
    .min(1, "Ce texte ne peut pas être vide.")
    .max(maxLength, `Texte trop long (${maxLength} caractères au plus).`)
    .refine((value) => !NO_FIGURES.test(value), {
      message:
        "Aucun chiffre à l'écran : la valeur se montre, elle ne se promet pas en chiffres.",
    })
    .refine((value) => !EM_DASH.test(value), {
      message:
        "Pas de tiret cadratin : préférer une virgule ou un retour à la ligne.",
    });

/** Texte simple (le balisage *mot clé* n'y est pas pris en charge). */
const plainText = (description: string, maxLength: number) =>
  baseText(maxLength)
    .refine((value) => !value.includes("*"), {
      message:
        "Le mot clé en bleu (*…*) n'est pas pris en charge dans ce champ.",
    })
    .describe(description);

/** Titre : accepte un ou plusieurs *mots clés* affichés en bleu. */
const titleText = (description: string, maxLength: number) =>
  baseText(maxLength)
    .refine((value) => (value.match(/\*/g)?.length ?? 0) % 2 === 0, {
      message: "Astérisques non appariés : écrire le mot clé *ainsi*.",
    })
    .describe(`${description} ; mot clé en bleu entre *astérisques*`);

export const benefitIconSchema = z
  .enum(["shield", "gauge", "trend"])
  .describe("Icône : shield (conformité), gauge (maîtrise), trend (valeur)");
export type BenefitIcon = z.infer<typeof benefitIconSchema>;

export const bimfinitySchema = z.object({
  console: z.object({
    label: plainText("Micro-libellé au-dessus de la barre de saisie", 48),
    query: plainText("Question tapée caractère par caractère (scène 2)", 90),
  }),
  processing: z.object({
    sources: z
      .array(plainText("Source de données", 28))
      .min(3)
      .max(6)
      .describe("Flux de données qui convergent vers la console (scène 3)"),
    subtitle: plainText(
      "Sous-titre lumineux (scène 3) ; les mots séparés par « · » apparaissent un à un",
      70,
    ),
  }),
  reveal: z.object({
    recommendation: titleText("Carte principale de la décision (scène 4)", 70),
    benefits: z
      .array(
        z.object({
          text: titleText("Bénéfice", 45),
          icon: benefitIconSchema,
        }),
      )
      .length(3)
      .describe("Trois cartes secondaires (scène 4)"),
  }),
  value: z.object({
    title: titleText(
      "Titre plein cadre (scène 5) ; une ligne par segment séparé par une virgule",
      90,
    ),
  }),
  outro: z.object({
    brandName: plainText(
      "Nom de marque (logo de remplacement, texte alternatif)",
      24,
    ),
    logoIncludesName: z
      .boolean()
      .describe(
        "Le fichier logo.svg contient-il déjà le nom ? Sinon, le nom est ajouté à côté.",
      ),
    tagline: titleText("Positionnement (scène 6)", 70),
    baseline: plainText("Signature (scène 6)", 60),
    poweredBy: plainText("Mention discrète (scène 6)", 48),
  }),
});

export type BimfinityProps = z.infer<typeof bimfinitySchema>;

/**
 * Vérifie les textes au lancement de chaque rendu : le schéma n'est sinon
 * contrôlé que par l'éditeur du Studio, pas par la CLI ni l'API.
 */
export const validateBimfinityProps: CalculateMetadataFunction<
  BimfinityProps
> = ({ props }) => {
  const result = bimfinitySchema.safeParse(props);
  if (!result.success) {
    // Message sur une seule ligne : la CLI n'affiche que la première ligne
    // d'une erreur levée dans le navigateur.
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")} : ${issue.message}`)
      .join(" | ");
    throw new Error(`Textes refusés par le schéma BIMfinity : ${issues}`);
  }
  return {};
};

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
      { text: "Conformité OPERAT *sécurisée*", icon: "shield" },
      { text: "CAPEX *maîtrisé*", icon: "gauge" },
      { text: "Valeur de l'actif *défendue*", icon: "trend" },
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
