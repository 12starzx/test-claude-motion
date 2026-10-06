/**
 * Ajustement automatique de la taille du texte.
 *
 * Garantit l'absence de débordement dans les deux formats, même si un texte
 * est modifié dans le Studio : on cherche la plus grande taille de police
 * (entre min et max) pour laquelle le texte tient dans le nombre de lignes
 * autorisé, en mesurant réellement les mots avec la police chargée.
 *
 * Les mesures ne sont fiables qu'une fois les polices chargées : AssetGate
 * attend les polices avant de monter les scènes.
 */
import { measureText } from "@remotion/layout-utils";
import { useMemo } from "react";
import { stripMarkup } from "./typography";

export type FitTextOptions = {
  /** Texte (le balisage *mot clé* est ignoré pour la mesure). */
  text: string;
  fontFamily: string;
  fontWeight: number;
  /** Interlettrage en em (ex. -0.02). */
  letterSpacingEm?: number;
  maxWidth: number;
  maxLines: number;
  maxFontSize: number;
  minFontSize: number;
  /** Hauteur maximale du bloc (optionnelle), en px. */
  maxHeight?: number;
  lineHeight?: number;
};

export type FitTextResult = {
  fontSize: number;
  lines: string[];
  /** Largeur de la ligne la plus longue, en px. */
  width: number;
  /** Faux si même la taille minimale déborde (signalé en console). */
  fits: boolean;
};

/** Marge de sécurité : les mesures mot à mot ignorent le crénage inter-mots. */
const SAFETY = 0.97;

const widthOf = (
  text: string,
  fontSize: number,
  options: FitTextOptions,
): number =>
  measureText({
    text,
    fontFamily: options.fontFamily,
    fontWeight: options.fontWeight,
    fontSize,
    letterSpacing:
      options.letterSpacingEm === undefined
        ? undefined
        : `${options.letterSpacingEm}em`,
  }).width;

/** Retour à la ligne glouton, uniquement sur les espaces sécables. */
export const wrapLines = (
  text: string,
  fontSize: number,
  maxWidth: number,
  options: FitTextOptions,
): string[] => {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && widthOf(candidate, fontSize, options) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
};

export const fitText = (options: FitTextOptions): FitTextResult => {
  const plain = stripMarkup(options.text);
  const maxWidth = options.maxWidth * SAFETY;
  const lineHeight = options.lineHeight ?? 1.15;

  let last: FitTextResult | null = null;
  for (
    let fontSize = Math.floor(options.maxFontSize);
    fontSize >= Math.ceil(options.minFontSize);
    fontSize -= 1
  ) {
    const lines = wrapLines(plain, fontSize, maxWidth, options);
    const width = Math.max(
      ...lines.map((line) => widthOf(line, fontSize, options)),
    );
    const heightOk =
      options.maxHeight === undefined ||
      lines.length * fontSize * lineHeight <= options.maxHeight;
    last = { fontSize, lines, width, fits: false };
    if (lines.length <= options.maxLines && width <= maxWidth && heightOk) {
      return { ...last, fits: true };
    }
  }

  if (last === null) {
    throw new Error(
      "fitText : minFontSize doit être inférieur ou égal à maxFontSize.",
    );
  }
  console.warn(
    `[BIMfinity] Texte trop long pour son cadre, même à ${last.fontSize}px : « ${plain} ». ` +
      "Raccourcissez-le ou ajustez les tailles dans theme.ts.",
  );
  return last;
};

/** Version hook, mémoïsée. */
export const useFitText = (options: FitTextOptions): FitTextResult =>
  useMemo(
    () => fitText(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.text,
      options.fontFamily,
      options.fontWeight,
      options.letterSpacingEm,
      options.maxWidth,
      options.maxLines,
      options.maxFontSize,
      options.minFontSize,
      options.maxHeight,
      options.lineHeight,
    ],
  );
