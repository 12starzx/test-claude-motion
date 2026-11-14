/**
 * Polices embarquées dans public/fonts (fichiers variables, licence SIL OFL) :
 * le rendu ne dépend d'aucun service en ligne.
 *
 * - Montserrat 800-900 : mots-chocs en capitales (« ABANDONNÉ. »).
 * - Inter 500-600 : sous-titres courants.
 * - Playfair Display italique : apartés (« Tu sais déjà lequel. »).
 */
import { staticFile } from "remotion";

export const impactFont = "JetonMontserrat";
export const bodyFont = "JetonInter";
export const serifFont = "JetonPlayfair";

const faces: { family: string; file: string; weight: string; style: string }[] =
  [
    {
      family: impactFont,
      file: "fonts/montserrat-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      family: bodyFont,
      file: "fonts/inter-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      family: serifFont,
      file: "fonts/playfair-italic-latin.woff2",
      weight: "400 900",
      style: "italic",
    },
  ];

let loading: Promise<unknown> | null = null;

export const waitForFonts = (): Promise<unknown> => {
  if (!loading) {
    loading = Promise.all(
      faces.map(async ({ family, file, weight, style }) => {
        const face = new FontFace(
          family,
          `url(${staticFile(file)}) format("woff2")`,
          {
            weight,
            style,
          },
        );
        await face.load();
        document.fonts.add(face);
      }),
    );
  }
  return loading;
};
