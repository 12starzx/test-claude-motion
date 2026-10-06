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
  useConsoleGeometry,
} from "../components/console/CopilotConsole";
import type { ConsoleState } from "../components/console/CopilotConsole";
import { GlassCard } from "../components/ui/GlassCard";
import { useFitText } from "../lib/fit";
import { useLayout } from "../lib/layout";
import { clamp, mix, springAt } from "../lib/motion";
import { frenchTypography } from "../lib/typography";
import type { FormatLayout } from "../theme";
import {
  colors,
  fontWeights,
  fonts,
  springs,
  timings,
  withAlpha,
} from "../theme";

export type SceneProcessingProps = {
  label: string;
  query: string;
  sources: string[];
  subtitle: string;
};

type Point = { x: number; y: number };
type ChipBox = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
};

const CHIP_DOT = 10;
const CHIP_DOT_GAP = 12;
/** Les flux visent la barre à 42 % de l'écart au centre : ils convergent. */
const CONVERGENCE = 0.42;
/** Marge autour du couloir d'un flux, qu'aucune puce ne doit occuper. */
const CORRIDOR_MARGIN = 18;
/** Réductions successives des puces si les flux ne peuvent pas être évités. */
const CHIP_SCALES = [1, 0.9, 0.8, 0.72];

type Measured = { label: string; width: number };
type Interval = [number, number];
type Placed = { chip: Measured; x: number };

const flowTargetX = (x: number, center: number): number =>
  center + (x - center) * CONVERGENCE;

const overlaps = (a: Interval, b: Interval): boolean =>
  a[0] < b[1] && b[0] < a[1];

const expanded = (corridors: Interval[]): Interval[] =>
  corridors.map(([a, b]) => [a - CORRIDOR_MARGIN, b + CORRIDOR_MARGIN]);

/**
 * Place un groupe de puces depuis un bord (gauche ou droite) en sautant les
 * couloirs des flux déjà tracés. Renvoie null si le groupe dépasse le centre.
 */
const packFromEdge = (
  chips: Measured[],
  corridors: Interval[],
  edge: number,
  center: number,
  gap: number,
  direction: 1 | -1,
): Placed[] | null => {
  const blocked = expanded(corridors);
  const placed: Placed[] = [];
  let cursor = edge;
  const ordered = direction === 1 ? chips : [...chips].reverse();
  for (const chip of ordered) {
    let start = direction === 1 ? cursor : cursor - chip.width;
    let moved = true;
    while (moved) {
      moved = false;
      for (const [a, b] of blocked) {
        if (overlaps([start, start + chip.width], [a, b])) {
          start = direction === 1 ? b : a - chip.width;
          moved = true;
        }
      }
    }
    const crossesCenter =
      direction === 1 ? start + chip.width > center : start < center;
    if (crossesCenter) {
      return null;
    }
    placed.push({ chip, x: start + chip.width / 2 });
    cursor = direction === 1 ? start + chip.width + gap : start - gap;
  }
  return direction === 1 ? placed : placed.reverse();
};

/**
 * Variante : remplit de gauche à droite tous les espaces libres entre les
 * couloirs (y compris au centre). Renvoie null si une puce ne trouve pas de place.
 */
const packInGaps = (
  chips: Measured[],
  corridors: Interval[],
  left: number,
  right: number,
  gap: number,
): Placed[] | null => {
  const blocked = expanded(corridors).sort((a, b) => a[0] - b[0]);
  const placed: Placed[] = [];
  let cursor = left;
  for (const chip of chips) {
    let start = cursor;
    let moved = true;
    while (moved) {
      moved = false;
      for (const [a, b] of blocked) {
        if (overlaps([start, start + chip.width], [a, b])) {
          start = b;
          moved = true;
        }
      }
    }
    if (start + chip.width > right) {
      return null;
    }
    placed.push({ chip, x: start + chip.width / 2 });
    cursor = start + chip.width + gap;
  }
  return placed;
};

/**
 * Place les puces sans chevauchement ni débordement (largeurs réellement
 * mesurées). La première rangée est centrée (en léger arc en 16:9) ; les
 * rangées suivantes se logent hors du trajet des flux des rangées
 * supérieures (sur les côtés, sinon dans les espaces libres). `clean` est
 * faux si une rangée a dû être centrée faute de place.
 */
const layoutChipsAtScale = (
  labels: string[],
  layout: FormatLayout,
  scale: number,
): { boxes: ChipBox[]; clean: boolean } => {
  const p = layout.processing;
  const left = layout.safe.x;
  const right = layout.width - layout.safe.x;
  const center = layout.width / 2;
  const fontSize = Math.round(p.chipFontSize * scale);
  const padX = p.chipPadX * scale;
  const height = Math.round(p.chipHeight * scale);
  const gap = p.chipGap * scale;
  const measured: Measured[] = labels.map((label) => {
    const text = frenchTypography(label);
    const textWidth = measureText({
      text,
      fontFamily: fonts.body,
      fontWeight: fontWeights.bodyMedium,
      fontSize,
      letterSpacing: "0.01em",
    }).width;
    return {
      label: text,
      width: Math.ceil(textWidth + padX * 2 + CHIP_DOT + CHIP_DOT_GAP),
    };
  });

  // Rangées gloutonnes, bornées en nombre de puces et en largeur.
  const rows: Measured[][] = [];
  for (const chip of measured) {
    const row = rows[rows.length - 1];
    const rowWidth = row
      ? row.reduce((sum, item) => sum + item.width, 0) + gap * row.length
      : 0;
    if (
      !row ||
      row.length >= p.maxChipsPerRow ||
      rowWidth + chip.width > right - left
    ) {
      rows.push([chip]);
    } else {
      row.push(chip);
    }
  }

  const centered = (row: Measured[]): Placed[] => {
    const total =
      row.reduce((sum, item) => sum + item.width, 0) + gap * (row.length - 1);
    let cursor = center - total / 2;
    return row.map((chip) => {
      const x = cursor + chip.width / 2;
      cursor += chip.width + gap;
      return { chip, x };
    });
  };

  let clean = true;
  const corridors: Interval[] = [];
  const boxes = rows.flatMap((row, rowIndex) => {
    let placed: Placed[] | null = null;
    if (rowIndex === 0) {
      placed = centered(row);
    } else {
      const split = Math.ceil(row.length / 2);
      const leftSide = packFromEdge(
        row.slice(0, split),
        corridors,
        left,
        center,
        gap,
        1,
      );
      const rightSide = packFromEdge(
        row.slice(split),
        corridors,
        right,
        center,
        gap,
        -1,
      );
      placed =
        leftSide && rightSide
          ? [...leftSide, ...rightSide]
          : packInGaps(row, corridors, left, right, gap);
      if (!placed) {
        clean = false;
        placed = centered(row);
      }
    }

    const span = Math.max(
      ...placed.map(({ chip, x }) => Math.abs(x - center) + chip.width / 2),
      1,
    );
    const rowBoxes = placed.map(({ chip, x }) => {
      const spread = (x - center) / span;
      return {
        label: chip.label,
        width: chip.width,
        height,
        fontSize,
        x,
        y: p.chipsTopY + rowIndex * p.rowGap + p.arcDepth * spread * spread,
      };
    });
    rowBoxes.forEach((box) => {
      const target = flowTargetX(box.x, center);
      corridors.push([Math.min(box.x, target), Math.max(box.x, target)]);
    });
    return rowBoxes;
  });
  return { boxes, clean };
};

/**
 * Mise en page des puces : taille nominale si possible, sinon puces
 * légèrement réduites pour dégager le trajet des flux. En dernier recours,
 * la taille nominale est conservée et les flux passent derrière les puces
 * (masqués sous elles).
 */
const layoutChips = (labels: string[], layout: FormatLayout): ChipBox[] => {
  for (const scale of CHIP_SCALES) {
    const result = layoutChipsAtScale(labels, layout, scale);
    if (result.clean) {
      return result.boxes;
    }
  }
  return layoutChipsAtScale(labels, layout, 1).boxes;
};

/** Point d'une courbe de Bézier cubique. */
const bezier = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x:
      u * u * u * a.x +
      3 * u * u * t * b.x +
      3 * u * t * t * c.x +
      t * t * t * d.x,
    y:
      u * u * u * a.y +
      3 * u * u * t * b.y +
      3 * u * t * t * c.y +
      t * t * t * d.y,
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
  const consoleY = mix(
    layout.console.centerY,
    layout.console.processingCenterY,
    move,
  );
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
  const center = layout.width / 2;

  /** Apparition, échelle et opacité d'une puce à la frame courante. */
  const chipVisual = (index: number) => {
    const chipIn = t.chipsIn + index * t.chipStagger;
    const enter = springAt(frame, fps, chipIn, springs.snappy, 22);
    const fade = springAt(frame, fps, chipIn, springs.smooth, 18);
    return {
      enter,
      opacity: fade * (1 - converge),
      scale: (0.86 + 0.14 * enter) * (1 - 0.45 * converge),
      lift: (1 - enter) * -18,
    };
  };

  /** Position d'une puce : elle glisse vers la barre pendant la convergence. */
  const chipPosition = (chip: ChipBox): Point => ({
    x: mix(chip.x, flowTargetX(chip.x, center), converge * 0.9),
    y: mix(chip.y, barTop, converge * 0.9),
  });

  /* ---------- Sous-titre ---------- */
  const words = useMemo(
    () =>
      subtitle
        .split("·")
        .map((word) => frenchTypography(word.trim()))
        .filter(Boolean),
    [subtitle],
  );
  const subtitleFit = useFitText({
    text: words.join(" · "),
    fontFamily: fonts.heading,
    fontWeight: fontWeights.heading,
    letterSpacingEm: 0.01,
    maxWidth: layout.width - layout.safe.x * 2,
    maxLines: layout.name === "portrait" ? 2 : 1,
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
          {/* Les flux passent toujours DERRIÈRE les puces, jamais sur un libellé. */}
          <mask
            id="bim-chip-mask"
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={layout.width}
            height={layout.height}
          >
            <rect width={layout.width} height={layout.height} fill="white" />
            {chips.map((chip, index) => {
              const v = chipVisual(index);
              const { x, y } = chipPosition(chip);
              const w = chip.width * v.scale;
              const h = chip.height * v.scale;
              return (
                <rect
                  key={chip.label + index}
                  x={x - w / 2}
                  y={y + v.lift - h / 2}
                  width={w}
                  height={h}
                  rx={h / 2}
                  fill="black"
                  fillOpacity={Math.min(1, v.opacity * 1.5)}
                />
              );
            })}
          </mask>
        </defs>
        <g mask="url(#bim-chip-mask)">
          {chips.map((chip, index) => {
            const chipIn = t.chipsIn + index * t.chipStagger;
            const draw = springAt(
              frame,
              fps,
              chipIn + t.flowDelay,
              springs.smooth,
              26,
            );
            const chipPos = chipPosition(chip);
            const start: Point = {
              x: chipPos.x,
              y: chipPos.y + chip.height / 2,
            };
            const end: Point = { x: flowTargetX(chip.x, center), y: barTop };
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
                  const cycle =
                    ((frame - chipIn) / 34 + k / 3 + index * 0.13) % 1;
                  const travel = Easing.in(Easing.quad)(Math.max(0, cycle));
                  const point = bezier(start, c1, c2, end, travel);
                  const fade = Math.sin(Math.PI * Math.max(0, cycle));
                  return (
                    <g key={k} opacity={draw * fade}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={10}
                        fill={withAlpha(colors.glow, 0.22)}
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={3.4}
                        fill={colors.text}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Puces des sources */}
      {chips.map((chip, index) => {
        const v = chipVisual(index);
        const { x, y } = chipPosition(chip);
        return (
          <GlassCard
            key={chip.label + index}
            radius={chip.height / 2}
            opacity={v.opacity}
            glow={0.35}
            phase={index}
            style={{
              position: "absolute",
              left: x - chip.width / 2,
              top: y - chip.height / 2 + v.lift,
              width: chip.width,
              height: chip.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: CHIP_DOT_GAP,
              boxSizing: "border-box",
              transform: `scale(${v.scale})`,
              fontFamily: fonts.body,
              fontWeight: fontWeights.bodyMedium,
              fontSize: chip.fontSize,
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
      <CopilotConsole
        label={label}
        query={query}
        state={state}
        globalFrame={globalFrame}
      />

      {/* Sous-titre lumineux, mot à mot */}
      <div
        style={{
          position: "absolute",
          left: layout.safe.x,
          right: layout.safe.x,
          top:
            consoleY +
            layout.processing.subtitleOffsetY -
            subtitleFit.fontSize * 0.6,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: "0.45em",
          rowGap: "0.1em",
          fontFamily: fonts.heading,
          fontWeight: fontWeights.heading,
          fontSize: subtitleFit.fontSize,
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          transform: `translateY(${-subtitleExit * 26}px)`,
        }}
      >
        {words.map((word, index) => {
          const appear = springAt(
            frame,
            fps,
            t.subtitleIn + index * t.wordStagger,
            springs.smooth,
            20,
          );
          const nextAppear = springAt(
            frame,
            fps,
            t.subtitleIn + (index + 1) * t.wordStagger,
            springs.smooth,
            20,
          );
          const glowPulse = interpolate(
            Math.sin((globalFrame + index * 9) * 0.12),
            [-1, 1],
            [0.55, 1],
            clamp,
          );
          return (
            <span
              key={word + index}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.45em",
                whiteSpace: "nowrap",
              }}
            >
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
              {/* Le séparateur reste accroché au mot qui le précède ; il
                  apparaît avec le mot suivant. */}
              {index < words.length - 1 ? (
                <span
                  style={{
                    color: colors.glow,
                    opacity: nextAppear * (1 - subtitleExit),
                  }}
                >
                  ·
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
