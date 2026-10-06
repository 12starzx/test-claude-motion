/**
 * Scène 6 : Positionnement et outro (27 à 32 s).
 *
 * Bloc-marque : logo BIMfinity (fichier fourni ou placeholder), positionnement
 * « Le copilote de décision du tertiaire. », signature « Chaque mètre carré,
 * une décision. » et mention discrète « Propulsé par HB Engineering ».
 */
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { HighlightedText } from "../components/ui/HighlightedText";
import { Logo } from "../components/ui/Logo";
import { useFitText } from "../lib/fit";
import { useLayout } from "../lib/layout";
import { springAt, useSceneMotion } from "../lib/motion";
import { frenchTypography } from "../lib/typography";
import {
  colors,
  fontWeights,
  fonts,
  springs,
  timings,
  withAlpha,
} from "../theme";

export type SceneOutroProps = {
  brandName: string;
  logoIncludesName: boolean;
  tagline: string;
  baseline: string;
  poweredBy: string;
  duration: number;
};

const TAGLINE_LINE_HEIGHT = 1.1;

export const SceneOutro: React.FC<SceneOutroProps> = ({
  brandName,
  logoIncludesName,
  tagline,
  baseline,
  poweredBy,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const o = layout.outro;
  const t = timings.outro;
  const motion = useSceneMotion({
    duration,
    enter: "fade",
    exit: "cut",
    amplitude: layout.parallax,
  });

  const taglineFit = useFitText({
    text: frenchTypography(tagline),
    fontFamily: fonts.heading,
    fontWeight: fontWeights.heading,
    letterSpacingEm: -0.025,
    maxWidth: o.maxWidth,
    maxLines: o.taglineMaxLines,
    maxFontSize: o.taglineMaxFontSize,
    minFontSize: o.taglineMinFontSize,
    lineHeight: TAGLINE_LINE_HEIGHT,
  });
  const baselineFit = useFitText({
    text: frenchTypography(baseline),
    fontFamily: fonts.body,
    fontWeight: fontWeights.body,
    maxWidth: o.maxWidth,
    maxLines: 2,
    maxFontSize: o.baselineFontSize,
    minFontSize: Math.round(o.baselineFontSize * 0.7),
  });

  const poweredByFit = useFitText({
    text: frenchTypography(poweredBy),
    fontFamily: fonts.body,
    fontWeight: fontWeights.bodyMedium,
    letterSpacingEm: 0.08,
    maxWidth: layout.width - layout.safe.x * 2,
    maxLines: 1,
    maxFontSize: o.poweredByFontSize,
    minFontSize: Math.round(o.poweredByFontSize * 0.7),
  });

  const logoEnter = springAt(frame, fps, t.logoIn, springs.punch, 40);
  const logoFade = springAt(frame, fps, t.logoIn, springs.smooth, 12);
  const taglineIn = springAt(frame, fps, t.taglineIn, springs.smooth, 24);
  const baselineIn = springAt(frame, fps, t.baselineIn, springs.smooth, 24);
  const poweredIn = springAt(frame, fps, t.poweredByIn, springs.smooth, 26);
  const breathe = 0.85 + 0.15 * Math.sin(frame * 0.07);

  const reveal = (progress: number, depth: number) => ({
    opacity: progress * motion.opacity,
    transform: `translateY(${(1 - progress) * 30 + motion.parallaxY(depth)}px)`,
  });

  return (
    <AbsoluteFill>
      {/* Halo derrière le logo */}
      <div
        style={{
          position: "absolute",
          left: layout.width / 2 - o.logoHeight * 3,
          top: o.logoCenterY - o.logoHeight * 1.6,
          width: o.logoHeight * 6,
          height: o.logoHeight * 3.2,
          background: `radial-gradient(ellipse at center, ${withAlpha(colors.primary, 0.28 * breathe)} 0%, transparent 65%)`,
          opacity: logoFade * motion.opacity,
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: o.logoCenterY - o.logoHeight / 2,
          height: o.logoHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: logoFade * motion.opacity,
          transform: `translateY(${motion.parallaxY(0.6)}px) scale(${0.88 + 0.12 * logoEnter})`,
          filter: logoFade < 1 ? `blur(${(1 - logoFade) * 12}px)` : undefined,
        }}
      >
        <Logo
          height={o.logoHeight}
          brandName={brandName}
          logoIncludesName={logoIncludesName}
          maxWidth={o.maxWidth}
        />
      </div>

      {/* Positionnement, signature */}
      <div
        style={{
          position: "absolute",
          left: (layout.width - o.maxWidth) / 2,
          width: o.maxWidth,
          top: o.logoCenterY + o.logoHeight / 2 + o.logoHeight * 0.55,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: Math.round(o.baselineFontSize * 0.9),
        }}
      >
        <div
          style={{
            ...reveal(taglineIn, 1),
            fontFamily: fonts.heading,
            fontWeight: fontWeights.heading,
            fontSize: taglineFit.fontSize,
            lineHeight: TAGLINE_LINE_HEIGHT,
            letterSpacing: "-0.025em",
            color: colors.text,
            textWrap: "balance",
          }}
        >
          <HighlightedText text={tagline} glow={0.5 + 0.25 * breathe} />
        </div>
        <div
          style={{
            ...reveal(baselineIn, 1.3),
            fontFamily: fonts.body,
            fontWeight: fontWeights.body,
            fontSize: baselineFit.fontSize,
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            color: colors.accent,
            textWrap: "balance",
          }}
        >
          {frenchTypography(baseline)}
        </div>
      </div>

      {/* Mention discrète */}
      <div
        style={{
          position: "absolute",
          left: layout.safe.x,
          right: layout.safe.x,
          bottom: o.poweredByBottom,
          textAlign: "center",
          fontFamily: fonts.body,
          fontWeight: fontWeights.bodyMedium,
          fontSize: poweredByFit.fontSize,
          letterSpacing: "0.08em",
          color: colors.textSubtle,
          whiteSpace: "nowrap",
          ...reveal(poweredIn, 0.5),
        }}
      >
        {frenchTypography(poweredBy)}
      </div>
    </AbsoluteFill>
  );
};
