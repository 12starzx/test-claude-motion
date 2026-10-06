/**
 * Fallback du fond : dégradés radial et conique animés en CSS, avec flou et
 * bloom, dans les mêmes couleurs que le shader. Utilisé si WebGL est
 * indisponible, si le shader échoue, ou si theme.background.renderer = "css".
 */
import { AbsoluteFill } from "remotion";
import { useLayout } from "../../lib/layout";
import { background, colors, withAlpha } from "../../theme";
import type { BackgroundState } from "./backgroundTimeline";

export const CssGradientBackground: React.FC<BackgroundState> = ({
  time,
  intensity,
  bloom,
  drift,
}) => {
  const { height } = useLayout();
  const t = time;

  // Positions des pôles (en %), en orbite lente comme dans le shader.
  const p1 = { x: 18 + 7 * Math.sin(t * 0.19), y: 24 + 6 * Math.cos(t * 0.23) };
  const p2 = { x: 82 + 6 * Math.cos(t * 0.17), y: 74 + 7 * Math.sin(t * 0.21) };
  const p3 = { x: 56 + 10 * Math.sin(t * 0.13 + 1.3), y: 12 + 5 * Math.cos(t * 0.29) };
  const p4 = { x: 34 + 8 * Math.cos(t * 0.11 + 2.1), y: 88 + 4 * Math.sin(t * 0.25) };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: intensity,
          transform: `translateY(${-drift * height}px) scale(1.15)`,
          filter: "blur(48px) saturate(1.1)",
        }}
      >
        <AbsoluteFill
          style={{
            background: [
              `radial-gradient(ellipse 55% 60% at ${p1.x}% ${p1.y}%, ${withAlpha(colors.deep, 0.95)} 0%, transparent 70%)`,
              `radial-gradient(ellipse 45% 55% at ${p2.x}% ${p2.y}%, ${withAlpha(colors.primary, 0.55)} 0%, transparent 70%)`,
              `radial-gradient(ellipse 40% 35% at ${p3.x}% ${p3.y}%, ${withAlpha(colors.deep, 0.8)} 0%, transparent 75%)`,
              `radial-gradient(ellipse 45% 40% at ${p4.x}% ${p4.y}%, ${withAlpha(colors.deep, 0.75)} 0%, transparent 75%)`,
            ].join(", "),
          }}
        />
        {/* Couche conique : les « filaments » lumineux, en rotation lente. */}
        <AbsoluteFill
          style={{
            background: `conic-gradient(from ${t * 9}deg at 50% 55%, transparent 0deg, ${withAlpha(colors.glow, 0.1 + 0.12 * bloom)} 50deg, transparent 120deg, ${withAlpha(colors.primary, 0.08 + 0.1 * bloom)} 210deg, transparent 290deg)`,
            mixBlendMode: "screen",
          }}
        />
        {/* Bloom central. */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 50% 45% at 50% 50%, ${withAlpha(colors.glow, 0.28 * bloom)} 0%, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />
      </AbsoluteFill>
      {/* Lisibilité : la zone de lecture centrale reste sombre. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 48% 42% at 50% 50%, ${withAlpha(colors.background, background.focusDarken * (1 - 0.35 * bloom))} 0%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
