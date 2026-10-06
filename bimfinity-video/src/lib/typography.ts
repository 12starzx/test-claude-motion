/**
 * Typographie française et balisage des mots clés.
 */

/** Espace insécable (avant « : », à l'intérieur des guillemets). */
export const NBSP = "\u00A0";
/** Espace fine insécable (avant ; ! ?). */
export const NNBSP = "\u202F";

/**
 * Applique les règles typographiques françaises à un texte saisi « au clavier » :
 * - espace fine insécable avant ; ! ?
 * - espace insécable avant : (hors URL et heures)
 * - guillemets droits "…" convertis en « … », avec espaces insécables
 * - apostrophe typographique ’
 * - points de suspension …
 * - le séparateur « · » reste accroché au mot qui le précède
 *
 * Les astérisques du balisage *mot clé* sont préservés.
 */
export const frenchTypography = (input: string): string =>
  input
    .replace(/\.\.\./g, "\u2026")
    .replace(/'/g, "\u2019")
    .replace(/"([^"\n]+)"/g, "«$1»")
    .replace(/([^\s;!?:])[ \u00A0\u202F]*([;!?])/g, `$1${NNBSP}$2`)
    .replace(/([^\s;!?:])[ \u00A0\u202F]*:(?=\s|$)/g, `$1${NBSP}:`)
    .replace(/«[ \u00A0\u202F]*/g, `«${NBSP}`)
    .replace(/[ \u00A0\u202F]*»/g, `${NBSP}»`)
    .replace(/ +· +/g, `${NBSP}· `);

export type TextSegment = { text: string; highlight: boolean };

/** Découpe « texte *mot clé* texte » en segments. */
export const parseHighlights = (input: string): TextSegment[] =>
  input
    .split("*")
    .map((text, index) => ({ text, highlight: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);

/** Texte brut, sans balisage (pour la mesure et l'accessibilité). */
export const stripMarkup = (input: string): string => input.replace(/\*/g, "");

/**
 * Découpe un titre en segments après chaque virgule (« A, B, C. » → 3 lignes).
 * Le balisage *mot clé* est conservé dans chaque segment.
 */
export const splitAfterCommas = (input: string): string[] =>
  input
    .split(/(?<=,)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
