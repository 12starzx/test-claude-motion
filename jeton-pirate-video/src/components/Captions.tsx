/**
 * Sous-titres animés mot à mot, lus dans le conducteur (timeline.ts).
 *
 * - "body"   : chaque mot glisse et se défloute.
 * - "impact" : chaque mot « tombe » (zoom arrière + flou) en capitales.
 * - "serif"  : italique, apparition plus lente.
 */
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bodyFont, impactFont, serifFont } from "../fonts";
import { clamp01, easeOut } from "../lib/anim";
import { cues, TOTAL_SECONDS } from "../timeline";
import type { Cue, CuePart } from "../timeline";
import { CAPTION_TOP, palette, VIDEO } from "../theme";

const STAGGER = { body: 0.1, impact: 0.17, serif: 0.14 } as const;
const WORD_IN = { body: 0.22, impact: 0.2, serif: 0.35 } as const;
const EXIT = 0.1;
const MAX_WIDTH = 960;

type Word = { text: string; italic: boolean };

/** Découpe une ligne en mots ; *…* bascule en italique. */
const tokenize = (text: string): Word[] => {
  let italic = false;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      let word = raw;
      const opens = word.startsWith("*");
      if (opens) {
        italic = true;
        word = word.slice(1);
      }
      const closes = word.endsWith("*");
      if (closes) {
        word = word.slice(0, -1);
      }
      const token = { text: word, italic };
      if (closes) {
        italic = false;
      }
      return token;
    });
};

/** Corps du mot-choc : réduit si la ligne est trop longue pour le cadre. */
const impactSize = (text: string): number =>
  Math.min(130, MAX_WIDTH / Math.max(1, text.length * 0.74));

const Line: React.FC<{ part: CuePart; elapsed: number }> = ({
  part,
  elapsed,
}) => {
  const kind = part.kind ?? "body";
  const words = tokenize(part.text);
  const start = part.delay ?? 0;
  const fontSize =
    kind === "impact" ? impactSize(part.text) : kind === "serif" ? 70 : 58;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: MAX_WIDTH,
        lineHeight: kind === "impact" ? 1.02 : 1.2,
        marginTop: kind === "impact" ? 6 : 0,
      }}
    >
      {words.map((word, i) => {
        const p = clamp01(
          (elapsed - start - i * STAGGER[kind]) / WORD_IN[kind],
        );
        const e = easeOut(p);
        const serifWord = kind === "serif" || word.italic;
        const style: React.CSSProperties =
          kind === "impact"
            ? {
                fontFamily: impactFont,
                fontWeight: 900,
                fontSize,
                letterSpacing: -fontSize * 0.02,
                transform: `scale(${1.35 - 0.35 * e})`,
                filter: `blur(${(1 - e) * 14}px)`,
                textShadow:
                  "0 0 26px rgba(170, 200, 255, 0.55), 0 4px 18px rgba(0, 0, 0, 0.6)",
              }
            : {
                fontFamily: serifWord ? serifFont : bodyFont,
                fontStyle: serifWord ? "italic" : "normal",
                fontWeight: serifWord ? 500 : 600,
                fontSize:
                  serifWord && kind === "body" ? fontSize * 1.12 : fontSize,
                letterSpacing: serifWord ? 0 : -0.5,
                transform: `translateY(${(1 - e) * 16}px)`,
                filter: `blur(${(1 - e) * 8}px)`,
                textShadow: "0 2px 16px rgba(0, 0, 0, 0.75)",
              };
        return (
          <span
            key={`${word.text}-${i}`}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              color: palette.text,
              opacity: e,
              marginRight: i < words.length - 1 ? fontSize * 0.26 : 0,
              ...style,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

const endOf = (index: number): number =>
  cues[index].end ?? cues[index + 1]?.at ?? TOTAL_SECONDS;

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  let active: { cue: Cue; end: number } | null = null;
  for (let i = cues.length - 1; i >= 0; i--) {
    if (cues[i].at <= t) {
      const end = endOf(i);
      if (t < end) {
        active = { cue: cues[i], end };
      }
      break;
    }
  }
  if (!active) {
    return null;
  }
  const elapsed = t - active.cue.at;
  const exit = clamp01((t - (active.end - EXIT)) / EXIT);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: CAPTION_TOP,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 1 - exit,
          filter: exit > 0 ? `blur(${exit * 6}px)` : undefined,
        }}
      >
        {active.cue.parts.map((part, i) => (
          <Line key={i} part={part} elapsed={elapsed} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
