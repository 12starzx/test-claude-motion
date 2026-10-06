/**
 * Chargement des polices via @remotion/google-fonts.
 *
 * - Space Grotesk : titres, chiffres de marque, libellés forts.
 * - Inter : textes courants, interface de la console, puces.
 *
 * Les graisses et sous-ensembles sont déclarés explicitement : cela limite
 * les téléchargements et reste compatible avec Remotion v5.
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

const spaceGrotesk = loadSpaceGrotesk("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
});

export const headingFontFamily = spaceGrotesk.fontFamily;
export const bodyFontFamily = inter.fontFamily;

/** Résout quand toutes les polices sont prêtes (utilisé par AssetGate). */
export const waitForFonts = (): Promise<unknown> =>
  Promise.all([spaceGrotesk.waitUntilDone(), inter.waitUntilDone()]);
