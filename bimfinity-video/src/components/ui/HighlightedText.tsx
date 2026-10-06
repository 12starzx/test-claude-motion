/**
 * Texte avec mot clé en bleu : « Décider plus vite » s'écrit « *Décider* plus vite ».
 * La typographie française est appliquée automatiquement.
 */
import type { CSSProperties } from "react";
import { keyword } from "../../theme";
import { frenchTypography, parseHighlights } from "../../lib/typography";

type HighlightedTextProps = {
  text: string;
  style?: CSSProperties;
  /** Intensité de la lueur du mot clé (0 à 1). */
  glow?: number;
};

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  style,
  glow = 0.6,
}) => {
  const segments = parseHighlights(frenchTypography(text));
  return (
    <span style={style}>
      {segments.map((segment, index) =>
        segment.highlight ? (
          <span
            key={index}
            style={{
              backgroundImage: keyword.gradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitBoxDecorationBreak: "clone",
              boxDecorationBreak: "clone",
              filter: `drop-shadow(0 0 ${Math.round(10 + 18 * glow)}px ${keyword.glow})`,
            }}
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
};
