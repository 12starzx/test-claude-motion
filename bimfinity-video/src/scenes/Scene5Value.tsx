/**
 * Scène 5 : La valeur (23 à 27 s).
 *
 * Titre plein cadre, une ligne par segment (découpe après chaque virgule) :
 *   « Décider plus vite, / investir mieux, / prouver la valeur. »
 * Entrées en stagger avec parallaxe par ligne, mot clé en bleu.
 */
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HighlightedText } from "../components/ui/HighlightedText";
import { fitText } from "../lib/fit";
import { useLayout } from "../lib/layout";
import { clamp, springAt, useSceneMotion } from "../lib/motion";
import { frenchTypography, splitAfterCommas } from "../lib/typography";
import { colors, fontWeights, fonts, springs, timings } from "../theme";

export type SceneValueProps = {
  title: string;
  duration: number;
};

const LINE_HEIGHT = 1.08;

export const SceneValue: React.FC<SceneValueProps> = ({ title, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const t = timings.value;
  const motion = useSceneMotion({
    duration,
    enter: "fade",
    exit: "fade",
    amplitude: layout.parallax,
  });

  const segments = useMemo(
    () => splitAfterCommas(frenchTypography(title)),
    [title],
  );

  // Taille commune : chaque segment doit tenir sur une ligne ; à défaut,
  // on autorise deux lignes par segment (texte modifié plus long).
  const fontSize = useMemo(() => {
    const fit = (maxLines: number) =>
      segments.map((segment) =>
        fitText({
          text: segment,
          fontFamily: fonts.heading,
          fontWeight: fontWeights.headingStrong,
          letterSpacingEm: -0.035,
          maxWidth: layout.value.maxWidth,
          maxLines,
          maxFontSize: layout.value.maxFontSize,
          minFontSize: layout.value.minFontSize,
          lineHeight: LINE_HEIGHT,
        }),
      );
    const singleLine = fit(1);
    const results = singleLine.every((result) => result.fits)
      ? singleLine
      : fit(2);
    return Math.min(...results.map((result) => result.fontSize));
  }, [segments, layout.value]);

  const push = interpolate(frame, [0, duration], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.sin),
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${1 + 0.03 * push})`,
      }}
    >
      <div
        style={{
          maxWidth: layout.value.maxWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          fontFamily: fonts.heading,
          fontWeight: fontWeights.headingStrong,
          fontSize,
          lineHeight: LINE_HEIGHT,
          letterSpacing: "-0.035em",
          color: colors.text,
        }}
      >
        {segments.map((segment, index) => {
          const start = t.linesIn + index * t.lineStagger;
          const enter = springAt(frame, fps, start, springs.snappy, 30);
          const fade = springAt(frame, fps, start, springs.smooth, 12);
          const depth = 1 + index * 0.35;
          return (
            <div
              key={index}
              style={{
                opacity: fade * motion.opacity,
                transform: `translateY(${(1 - enter) * 70 + motion.parallaxY(depth)}px)`,
                filter: fade < 1 ? `blur(${(1 - fade) * 10}px)` : undefined,
                textWrap: "balance",
              }}
            >
              <HighlightedText
                text={segment}
                glow={0.55 + 0.3 * Math.sin((frame - start) * 0.1)}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
