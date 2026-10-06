/**
 * Graphique illustratif de la recommandation « en deux phases ».
 *
 * Purement visuel : aucun axe gradué, aucune valeur, aucune donnée économique.
 * Deux groupes de barres (phase 1, phase 2) et une courbe de tendance qui se
 * dessine. Les hauteurs ci-dessous sont des proportions graphiques arbitraires.
 */
import { useCurrentFrame, useVideoConfig } from "remotion";
import { springAt } from "../../lib/motion";
import { colors, springs, withAlpha } from "../../theme";

/** Proportions purement graphiques (0 à 1), sans signification chiffrée. */
const SHAPE = [0.3, 0.36, 0.41, 0.47, 0.52, 0.6, 0.67, 0.74, 0.82, 0.9];
const PHASE_SIZE = 5;

type Point = { x: number; y: number };

/** Courbe lisse (Catmull-Rom → Bézier) passant par les points. */
const smoothPath = (points: Point[]): string => {
  if (points.length < 2) {
    return "";
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

export const RevealChart: React.FC<{
  width: number;
  height: number;
  /** Frame (locale à la scène) de début des barres. */
  barsIn: number;
  barStagger: number;
  /** Frame de début du tracé de la courbe. */
  curveIn: number;
  opacity: number;
}> = ({ width, height, barsIn, barStagger, curveIn, opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const top = height * 0.08;
  const bottom = height - 6;
  const usable = bottom - top;
  const gap = width * 0.024;
  const phaseGap = gap * 3;
  const barWidth = (width - phaseGap - gap * (SHAPE.length - 2)) / SHAPE.length;

  const bars = SHAPE.map((value, index) => {
    const x =
      index * (barWidth + gap) + (index >= PHASE_SIZE ? phaseGap - gap : 0);
    const grow = springAt(
      frame,
      fps,
      barsIn + index * barStagger,
      springs.snappy,
      26,
    );
    const fullHeight = usable * value;
    return { x, fullHeight, grow, phase: index < PHASE_SIZE ? 1 : 2 };
  });

  const points = bars.map((bar) => ({
    x: bar.x + barWidth / 2,
    y: bottom - bar.fullHeight - height * 0.07,
  }));
  const curve = smoothPath(points);
  const draw = springAt(frame, fps, curveIn, springs.smooth, 48);
  const separatorX = bars[PHASE_SIZE].x - phaseGap / 2;
  const last = points[points.length - 1];
  const headPulse = 0.75 + 0.25 * Math.sin(frame * 0.16);

  return (
    <svg width={width} height={height} style={{ overflow: "visible", opacity }}>
      <defs>
        <linearGradient id="bim-bar-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.primary} stopOpacity={0.55} />
          <stop offset="100%" stopColor={colors.deep} stopOpacity={0.15} />
        </linearGradient>
        <linearGradient id="bim-bar-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.glow} stopOpacity={0.9} />
          <stop offset="100%" stopColor={colors.primary} stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="bim-curve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colors.glow} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        {/* L'aire se découvre au rythme du tracé de la courbe. */}
        <clipPath id="bim-area-clip">
          <rect
            x={0}
            y={0}
            width={points[0].x + draw * (last.x - points[0].x)}
            height={height}
          />
        </clipPath>
        <linearGradient id="bim-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.glow} stopOpacity={0.22} />
          <stop offset="100%" stopColor={colors.glow} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Repères horizontaux discrets, sans graduation */}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={0}
          x2={width}
          y1={top + usable * ratio}
          y2={top + usable * ratio}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="4 8"
        />
      ))}
      <line
        x1={0}
        x2={width}
        y1={bottom}
        y2={bottom}
        stroke="rgba(255,255,255,0.14)"
      />

      {/* Séparation entre les deux phases */}
      <line
        x1={separatorX}
        x2={separatorX}
        y1={top}
        y2={bottom}
        stroke={withAlpha(colors.accent, 0.28)}
        strokeDasharray="3 7"
        opacity={springAt(
          frame,
          fps,
          barsIn + PHASE_SIZE * barStagger,
          springs.smooth,
          20,
        )}
      />

      {/* Barres */}
      {bars.map((bar, index) => {
        const h = Math.max(0, bar.fullHeight * bar.grow);
        return (
          <rect
            key={index}
            x={bar.x}
            y={bottom - h}
            width={barWidth}
            height={h}
            rx={Math.min(8, barWidth / 4)}
            fill={`url(#bim-bar-${bar.phase})`}
            opacity={Math.min(1, bar.grow * 1.5)}
          />
        );
      })}

      {/* Aire sous la courbe */}
      <path
        d={`${curve} L ${last.x} ${bottom} L ${points[0].x} ${bottom} Z`}
        fill="url(#bim-area)"
        clipPath="url(#bim-area-clip)"
        opacity={Math.min(1, draw * 2)}
      />
      {/* Halo de la courbe */}
      <path
        d={curve}
        fill="none"
        stroke={withAlpha(colors.glow, 0.35)}
        strokeWidth={10}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={draw > 0.001 ? 0.6 : 0}
      />
      {/* Courbe */}
      <path
        d={curve}
        fill="none"
        stroke="url(#bim-curve)"
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        opacity={draw > 0.001 ? 1 : 0}
      />
      {/* Point d'arrivée */}
      <g opacity={springAt(frame, fps, curveIn + 34, springs.smooth, 16)}>
        <circle
          cx={last.x}
          cy={last.y}
          r={16 * headPulse}
          fill={withAlpha(colors.glow, 0.22)}
        />
        <circle cx={last.x} cy={last.y} r={6} fill={colors.text} />
      </g>
    </svg>
  );
};
