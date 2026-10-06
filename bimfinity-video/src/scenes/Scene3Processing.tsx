/**
 * Scène 3 : Le traitement (9 à 13 s).
 *
 * La console « réfléchit » : des flux de données étiquetés (BIM, Énergie,
 * Réglementation, Coûts, Finance) convergent vers la barre, et le sous-titre
 * « Centralise · Analyse · Arbitre » s'allume mot à mot.
 * En fin de scène, les sources sont absorbées par la console (raccord avec
 * la révélation).
 */
import { measureText } from "@remotion/layout-utils";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CopilotConsole,
  initialConsoleState,
  useConsoleGeometry,
} from "../components/console/CopilotConsole";
import type { ConsoleState } from "../components/console/CopilotConsole";
import { GlassCard } from "../components/ui/GlassCard";
import { useFitText } from "../lib/fit";
import { useLayout } from "../lib/layout";
import { clamp, mix, springAt } from "../lib/motion";
import { frenchTypography } from "../lib/typography";
import type { FormatLayout } from "../theme";
import { colors, fontWeights, fonts, springs, timings, withAlpha } from "../theme";

export type SceneProcessingProps = {
  label: string;
  query: string;
  sources: string[];
  subtitle: string;
};

type Point = { x: number; y: number };
type ChipBox = { label: string; x: number; y: number; width: number };

const CHIP_DOT = 10;
const CHIP_DOT_GAP = 12;

/**
 * Place les puces en rangées centrées (mesure réelle des libellés : aucune
 * puce ne peut en chevaucher une autre ni sortir du cadre). En 16:9, la
 * rangée dessine un léger arc au-dessus de la console.
 */
const layoutChips = (labels: string[], layout: FormatLayout): ChipBox[] => {
  const p = layout.processing;
  const maxRowWidth = layout.width - layout.safe.x * 2;
  const measured = labels.map((label) => {
    const text = frenchTypography(label);
    const textWidth = measureText({
      text,
      fontFamily: fonts.body,
      fontWeight: fontWeights.bodyMedium,
      fontSize: p.chipFontSize,
      letterSpacing: "0.01em",
    }).width;
    return { label: text, width: Math.ceil(textWidth + p.chipPadX * 2 + CHIP_DOT + CHIP_DOT_GAP) };
  });

  // Rangées gloutonnes, bornées en nombre de puces et en largeur.
  const rows: (typeof measured)[] = [];
  for (const chip of measured) {
    const row = rows[rows.length - 1];
    const rowWidth = row
      ? row.reduce((sum, item) => sum + item.width, 0) + p.chipGap * row.length
      : 0;
    if (!row || row.length >= p.maxChipsPerRow || rowWidth + chip.width > maxRowWidth) {
      rows.push([chip]);
    } else {
      row.push(chip);
    }
  }

  const center = layout.width / 2;
  return rows.flatMap((row, rowIndex) => {
    const total = row.reduce((sum, item) => sum + item.width, 0) + p.chipGap * (row.length - 1);
    let cursor = center - total / 2;
    return row.map((chip) => {
      const x = cursor + chip.width / 2;
      cursor += chip.width + p.chipGap;
      const spread = total > 0 ? (x - center) / (total / 2) : 0;
      return {
        label: chip.label,
        width: chip.width,
        x,
        y: p.chipsTopY + rowIndex * p.rowGap + p.arcDepth * spread * spread,
      };
    });
  });
};

/** Point d'une courbe de Bézier cubique. */
const bezier = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};

export const SceneProcessing: React.FC<SceneProcessingProps> = ({
  label,
  query,
  sources,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const t = timings.processing;
  const globalFrame = frame + timings.scenes.processing.from;
  const geometry = useConsoleGeometry(query);

  /* ---------- Console : descend légèrement et passe en traitement ---------- */
  const move = springAt(frame, fps, 0, springs.smooth, 30);
  const consoleY = mix(layout.console.centerY, layout.console.processingCenterY, move);
  const processing = springAt(frame, fps, 2, springs.smooth, 22);

  const state: ConsoleState = {
    ...initialConsoleState,
    typedCount: Array.from(frenchTypography(query)).length,
    submitted: 1,
    ring: 1,
    processing,
    // Le micro-label s'efface pendant que les flux arrivent sur la barre ;
    // il revient quand la console devient l'en-tête (scène 4).
    labelOpacity: 1 - springAt(frame, fps, t.chipsIn, springs.smooth, 16),
    centerY: consoleY,
  };

  /* ---------- Sources et flux ---------- */
  const chips = useMemo(() => layoutChips(sources, layout), [sources, layout]);
  const converge = springAt(frame, fps, t.convergeAt, springs.smooth, 26);
  const barTop = consoleY - geometry.barHeight / 2 + 4;

  /* ---------- Sous-titre ---------- */
  const words = useMemo(
    () => subtitle.split("·").map((word) => frenchTypography(word.trim())).filter(Boolean),
    [subtitle],
  );
  const subtitleFit = useFitText({
    text: words.join(" · "),
    fontFamily: fonts.heading,
    fontWeight: fontWeights.heading,
    letterSpacingEm: 0.01,
    maxWidth: layout.width - layout.safe.x * 2,
    maxLines: 1,
    maxFontSize: layout.processing.subtitleMaxFontSize,
    minFontSize: layout.processing.subtitleMinFontSize,
  });
  const subtitleExit = converge;

  return (
    <AbsoluteFill>
      {/* Flux de données (sous les puces et la console) */}
      <svg
        width={layout.width}
        height={layout.height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="bim-flow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.accent} stopOpacity={0.15} />
            <stop offset="100%" stopColor={colors.glow} stopOpacity={0.95} />
          </linearGradient>
        </defs>
        {chips.map((chip, index) => {
          const chipIn = t.chipsIn + index * t.chipStagger;
          const draw = springAt(frame, fps, chipIn + t.flowDelay, springs.smooth, 26);
          const chipPos = {
            x: mix(chip.x, mix(layout.width / 2, chip.x, 0.42), converge * 0.9),
            y: mix(chip.y, barTop, converge * 0.9),
          };
          const start: Point = { x: chipPos.x, y: chipPos.y + layout.processing.chipHeight / 2 };
          const end: Point = {
            x: layout.width / 2 + (chip.x - layout.width / 2) * 0.42,
            y: barTop,
          };
          const reach = (end.y - start.y) * 0.55;
          const c1: Point = { x: start.x, y: start.y + reach };
          const c2: Point = { x: end.x, y: end.y - reach };
          const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
          const visibility = draw * (1 - converge);

          return (
            <g key={chip.label + index} opacity={visibility}>
              {/* Tracé de base */}
              <path
                d={d}
                fill="none"
                stroke="url(#bim-flow)"
                strokeWidth={1.6}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw}
              />
              {/* Données qui circulent */}
              <path
                d={d}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeDasharray="2 16"
                strokeDashoffset={-globalFrame * 1.6}
                opacity={0.55 * draw}
              />
              {/* Particules lumineuses */}
              {[0, 1, 2].map((k) => {
                const cycle = ((frame - chipIn) / 34 + k / 3 + index * 0.13) % 1;
                const travel = Easing.in(Easing.quad)(Math.max(0, cycle));
                const point = bezier(start, c1, c2, end, travel);
                const fade = Math.sin(Math.PI * Math.max(0, cycle));
                return (
                  <g key={k} opacity={draw * fade}>
                    <circle cx={point.x} cy={point.y} r={10} fill={withAlpha(colors.glow, 0.22)} />
                    <circle cx={point.x} cy={point.y} r={3.4} fill={colors.text} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Puces des sources */}
      {chips.map((chip, index) => {
        const chipIn = t.chipsIn + index * t.chipStagger;
        const enter = springAt(frame, fps, chipIn, springs.snappy, 22);
        const fade = springAt(frame, fps, chipIn, springs.smooth, 18);
        const x = mix(chip.x, mix(layout.width / 2, chip.x, 0.42), converge * 0.9);
        const y = mix(chip.y, barTop, converge * 0.9);
        const scale = (0.86 + 0.14 * enter) * (1 - 0.45 * converge);
        const p = layout.processing;
        return (
          <GlassCard
            key={chip.label + index}
            radius={p.chipHeight / 2}
            opacity={fade * (1 - converge)}
            glow={0.35}
            phase={index}
            style={{
              position: "absolute",
              left: x - chip.width / 2,
              top: y - p.chipHeight / 2 + (1 - enter) * -18,
              width: chip.width,
              height: p.chipHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: CHIP_DOT_GAP,
              boxSizing: "border-box",
              transform: `scale(${scale})`,
              fontFamily: fonts.body,
              fontWeight: fontWeights.bodyMedium,
              fontSize: p.chipFontSize,
              letterSpacing: "0.01em",
              color: colors.text,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: CHIP_DOT,
                height: CHIP_DOT,
                borderRadius: "50%",
                background: colors.glow,
                boxShadow: `0 0 10px ${colors.glow}`,
                flexShrink: 0,
              }}
            />
            {chip.label}
          </GlassCard>
        );
      })}

      {/* Console */}
      <CopilotConsole label={label} query={query} state={state} globalFrame={globalFrame} />

      {/* Sous-titre lumineux, mot à mot */}
      <div
        style={{
          position: "absolute",
          left: layout.safe.x,
          right: layout.safe.x,
          top: consoleY + layout.processing.subtitleOffsetY - subtitleFit.fontSize * 0.6,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: "0.45em",
          fontFamily: fonts.heading,
          fontWeight: fontWeights.heading,
          fontSize: subtitleFit.fontSize,
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          transform: `translateY(${-subtitleExit * 26}px)`,
        }}
      >
        {words.map((word, index) => {
          const appear = springAt(frame, fps, t.subtitleIn + index * t.wordStagger, springs.smooth, 20);
          const glowPulse = interpolate(
            Math.sin((globalFrame + index * 9) * 0.12),
            [-1, 1],
            [0.55, 1],
            clamp,
          );
          return (
            <span
              key={word + index}
              style={{ display: "flex", alignItems: "baseline", gap: "0.45em" }}
            >
              {index > 0 ? (
                <span style={{ color: colors.glow, opacity: appear * (1 - subtitleExit) }}>·</span>
              ) : null}
              <span
                style={{
                  color: colors.text,
                  opacity: appear * (1 - subtitleExit),
                  transform: `translateY(${(1 - appear) * 22}px)`,
                  display: "inline-block",
                  textShadow: `0 0 ${18 + 14 * glowPulse}px ${withAlpha(colors.glow, 0.75 * glowPulse)}, 0 0 4px ${withAlpha(colors.accent, 0.5)}`,
                }}
              >
                {word}
              </span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
