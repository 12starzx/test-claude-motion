/**
 * Scène 4 : La révélation (13 à 23 s). Le moment fort du film.
 *
 * La console se transforme : flash, « punch » d'échelle, bloom qui
 * s'intensifie (piloté par le fond), puis elle remonte en en-tête et les
 * cartes glass révèlent LA décision en stagger :
 *   - carte principale : « Recommandation : rénover en deux phases » + graphique illustratif ;
 *   - trois cartes secondaires (bénéfices), chacune avec son icône dessinée.
 */
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CopilotConsole,
  initialConsoleState,
} from "../components/console/CopilotConsole";
import type { ConsoleState } from "../components/console/CopilotConsole";
import { GlassCard } from "../components/ui/GlassCard";
import { HighlightedText } from "../components/ui/HighlightedText";
import { BenefitIconGlyph } from "../components/ui/Icons";
import { RevealChart } from "../components/ui/RevealChart";
import { fitText, useFitText } from "../lib/fit";
import { useLayout } from "../lib/layout";
import {
  clamp,
  mix,
  pulseEnvelope,
  springAt,
  useSceneMotion,
} from "../lib/motion";
import { frenchTypography } from "../lib/typography";
import type { BenefitIcon } from "../schema";
import {
  colors,
  fontWeights,
  fonts,
  springs,
  timings,
  withAlpha,
} from "../theme";

export type SceneRevealProps = {
  label: string;
  query: string;
  recommendation: string;
  benefits: { text: string; icon: BenefitIcon }[];
  /** Durée de la séquence (pour la sortie fondu + parallaxe). */
  duration: number;
};

const TITLE_LINE_HEIGHT = 1.12;
/** Espace entre l'icône et le texte d'une carte secondaire. */
const ICON_TEXT_GAP = 24;
const BENEFIT_LINE_HEIGHT = 1.18;

/** Reflet lumineux qui traverse une carte. */
const Shine: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      overflow: "hidden",
      pointerEvents: "none",
      opacity: progress > 0 && progress < 1 ? 1 : 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: "-20%",
        bottom: "-20%",
        width: "28%",
        left: `${mix(-40, 120, progress)}%`,
        transform: "skewX(-18deg)",
        background: `linear-gradient(90deg, transparent 0%, ${withAlpha(colors.accent, 0.1)} 50%, transparent 100%)`,
      }}
    />
  </div>
);

export const SceneReveal: React.FC<SceneRevealProps> = ({
  label,
  query,
  recommendation,
  benefits,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const t = timings.reveal;
  const r = layout.reveal;
  const globalFrame = frame + timings.scenes.reveal.from;
  const motion = useSceneMotion({
    duration,
    enter: "cut",
    exit: "fade",
    amplitude: layout.parallax,
  });

  /* ---------- La console se transforme en en-tête ---------- */
  const morph = springAt(frame, fps, 0, springs.snappy, 34);
  const consoleState: ConsoleState = {
    ...initialConsoleState,
    typedCount: Array.from(frenchTypography(query)).length,
    submitted: 1,
    ring: 1,
    pulse: pulseEnvelope(frame, fps, 0, t.flashAttack, 24),
    processing: 1 - springAt(frame, fps, t.processingOff, springs.smooth, 20),
    done: springAt(frame, fps, t.doneIn, springs.smooth, 22),
    centerY:
      mix(
        layout.console.processingCenterY,
        layout.console.headerCenterY,
        morph,
      ) + motion.parallaxY(0.5),
    scale: mix(1, layout.console.headerScale, morph),
    appear: motion.opacity,
    labelOpacity:
      springAt(frame, fps, t.labelIn, springs.smooth, 22) * motion.opacity,
  };

  /* ---------- Flash de révélation ---------- */
  const flash = pulseEnvelope(frame, fps, 0, 3, 20);

  /* ---------- Géométrie des cartes ---------- */
  const contentWidth = layout.width - layout.safe.x * 2;
  const contentHeight = r.contentBottom - r.contentTop;
  const isRow = r.direction === "row";
  const mainWidth = isRow ? r.mainCard.width : contentWidth;
  const benefitWidth = isRow
    ? contentWidth - r.mainCard.width - r.gap
    : contentWidth;
  const benefitHeight = isRow
    ? (contentHeight - r.gap * (benefits.length - 1)) / benefits.length
    : r.benefitCard.height;
  const mainHeight = isRow
    ? contentHeight
    : contentHeight - benefits.length * (benefitHeight + r.gap);

  const titleFit = useFitText({
    text: frenchTypography(recommendation),
    fontFamily: fonts.heading,
    fontWeight: fontWeights.heading,
    letterSpacingEm: -0.02,
    maxWidth: mainWidth - r.mainCard.padding * 2,
    maxLines: r.mainCard.titleMaxLines,
    maxFontSize: r.mainCard.titleMaxFontSize,
    minFontSize: r.mainCard.titleMinFontSize,
    lineHeight: TITLE_LINE_HEIGHT,
  });
  const titleHeight =
    titleFit.lines.length * titleFit.fontSize * TITLE_LINE_HEIGHT;
  const chartGap = isRow ? 44 : 36;
  const chartHeight = Math.max(
    120,
    mainHeight - r.mainCard.padding * 2 - titleHeight - chartGap,
  );

  const iconBox = r.benefitCard.iconSize + 20;
  const benefitTextWidth =
    benefitWidth - r.benefitCard.padding * 2 - iconBox - ICON_TEXT_GAP;
  // Une seule taille pour les trois cartes : alignement typographique.
  const benefitTexts = benefits.map((benefit) => benefit.text).join("\n");
  const benefitFontSize = useMemo(
    () =>
      Math.min(
        ...benefitTexts.split("\n").map(
          (text) =>
            fitText({
              text: frenchTypography(text),
              fontFamily: fonts.heading,
              fontWeight: fontWeights.heading,
              letterSpacingEm: -0.01,
              maxWidth: benefitTextWidth,
              maxLines: r.benefitCard.maxLines,
              maxFontSize: r.benefitCard.maxFontSize,
              minFontSize: r.benefitCard.minFontSize,
              maxHeight: benefitHeight - r.benefitCard.padding * 2,
              lineHeight: BENEFIT_LINE_HEIGHT,
            }).fontSize,
        ),
      ),
    [benefitTexts, benefitTextWidth, benefitHeight, r.benefitCard],
  );

  /* ---------- Mise en mouvement ---------- */
  const mainEnter = springAt(frame, fps, t.mainCardIn, springs.punch, 40);
  const mainFade = springAt(frame, fps, t.mainCardIn, springs.smooth, 18);
  const titleIn = springAt(frame, fps, t.titleIn, springs.smooth, 24);
  const chartFade = springAt(frame, fps, t.chartIn - 4, springs.smooth, 16);
  const push = interpolate(frame, [t.pushFrom, duration], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const keywordGlow = 0.45 + 0.35 * Math.sin(globalFrame * 0.09);

  return (
    <AbsoluteFill>
      {/* Flash de bloom au moment de la révélation */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% ${(layout.console.processingCenterY / layout.height) * 100}%, ${withAlpha(colors.glow, 0.42)} 0%, ${withAlpha(colors.primary, 0.12)} 45%, transparent 75%)`,
          opacity: flash,
          mixBlendMode: "screen",
        }}
      />

      {/* Contenu révélé, avec une légère poussée de caméra */}
      <AbsoluteFill
        style={{
          transform: `scale(${1 + 0.02 * push})`,
          transformOrigin: "50% 55%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: layout.safe.x,
            top: r.contentTop,
            width: contentWidth,
            height: contentHeight,
            display: "flex",
            flexDirection: isRow ? "row" : "column",
            gap: r.gap,
          }}
        >
          {/* Carte principale : la décision */}
          <GlassCard
            opacity={mainFade * motion.opacity}
            glow={0.55 + 0.45 * flash}
            style={{
              width: mainWidth,
              height: mainHeight,
              flexShrink: 0,
              padding: r.mainCard.padding,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: chartGap,
              overflow: "hidden",
              transform: `translateY(${(1 - mainEnter) * 50 + motion.parallaxY(1)}px) scale(${0.9 + 0.1 * mainEnter})`,
              filter:
                mainFade < 1 ? `blur(${(1 - mainFade) * 12}px)` : undefined,
            }}
          >
            <div
              style={{
                fontFamily: fonts.heading,
                fontWeight: fontWeights.heading,
                fontSize: titleFit.fontSize,
                lineHeight: TITLE_LINE_HEIGHT,
                letterSpacing: "-0.02em",
                color: colors.text,
                textWrap: "balance",
                opacity: titleIn,
                transform: `translateY(${(1 - titleIn) * 24}px)`,
              }}
            >
              <HighlightedText text={recommendation} glow={keywordGlow} />
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <RevealChart
                width={mainWidth - r.mainCard.padding * 2}
                height={chartHeight}
                barsIn={t.chartIn}
                barStagger={t.barStagger}
                curveIn={t.curveIn}
                opacity={chartFade}
              />
            </div>
            <Shine
              progress={interpolate(
                springAt(frame, fps, t.shineAt, springs.smooth, 50),
                [0, 0.999],
                [0, 1],
                clamp,
              )}
            />
          </GlassCard>

          {/* Cartes secondaires : les bénéfices */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: r.gap,
              width: benefitWidth,
              flexShrink: 0,
            }}
          >
            {benefits.map((benefit, index) => {
              const start = t.benefitsIn + index * t.benefitStagger;
              const enter = springAt(frame, fps, start, springs.punch, 36);
              const fade = springAt(frame, fps, start, springs.smooth, 16);
              const draw = springAt(frame, fps, start + 6, springs.smooth, 30);
              const underline = springAt(
                frame,
                fps,
                start + 12,
                springs.smooth,
                34,
              );
              const shine = springAt(
                frame,
                fps,
                t.shineAt + 10 + index * t.benefitStagger * 2,
                springs.smooth,
                44,
              );
              const depth = 1.15 + index * 0.12;
              return (
                <GlassCard
                  key={index}
                  opacity={fade * motion.opacity}
                  glow={0.4}
                  phase={index + 1}
                  style={{
                    height: benefitHeight,
                    padding: `0 ${r.benefitCard.padding}px`,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: ICON_TEXT_GAP,
                    overflow: "hidden",
                    transform: `translate(${isRow ? (1 - enter) * 60 : 0}px, ${(isRow ? 0 : (1 - enter) * 50) + motion.parallaxY(depth)}px) scale(${0.92 + 0.08 * enter})`,
                    filter: fade < 1 ? `blur(${(1 - fade) * 10}px)` : undefined,
                  }}
                >
                  <div
                    style={{
                      width: iconBox,
                      height: iconBox,
                      flexShrink: 0,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `radial-gradient(circle at 30% 25%, ${withAlpha(colors.primary, 0.35)}, ${withAlpha(colors.deep, 0.25)})`,
                      border: `1px solid ${withAlpha(colors.accent, 0.22)}`,
                      boxShadow: `0 0 24px ${withAlpha(colors.primary, 0.25 * draw)}`,
                    }}
                  >
                    <BenefitIconGlyph
                      icon={benefit.icon}
                      size={r.benefitCard.iconSize}
                      progress={draw}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.heading,
                      fontWeight: fontWeights.heading,
                      fontSize: benefitFontSize,
                      lineHeight: BENEFIT_LINE_HEIGHT,
                      letterSpacing: "-0.01em",
                      color: colors.text,
                      textWrap: "balance",
                      minWidth: 0,
                    }}
                  >
                    <HighlightedText text={benefit.text} glow={0.35} />
                  </div>
                  {/* Trait de validation qui se remplit (aucune valeur affichée) */}
                  <div
                    style={{
                      position: "absolute",
                      left: r.benefitCard.padding,
                      bottom: 0,
                      height: 2,
                      width: `calc(${underline * 100}% - ${r.benefitCard.padding * 2 * underline}px)`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                      boxShadow: `0 0 10px ${withAlpha(colors.glow, 0.7)}`,
                      opacity: 0.85,
                    }}
                  />
                  <Shine
                    progress={shine > 0.001 && shine < 0.999 ? shine : 0}
                  />
                </GlassCard>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      {/* Console devenue en-tête (au-dessus des cartes) */}
      <CopilotConsole
        label={label}
        query={query}
        state={consoleState}
        globalFrame={globalFrame}
      />
    </AbsoluteFill>
  );
};
