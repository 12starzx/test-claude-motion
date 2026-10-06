/**
 * Grain argentique léger : une tuile de bruit SVG (feTurbulence) répétée,
 * décalée de façon pseudo-aléatoire mais déterministe toutes les 2 frames.
 */
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

const TILE = 240;

const noiseTile = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='${TILE}' height='${TILE}'>` +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='saturate' values='0'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

export const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const x = Math.round(random(`grain-x-${step}`) * TILE);
  const y = Math.round(random(`grain-y-${step}`) * TILE);

  return (
    <AbsoluteFill
      style={{
        backgroundImage: noiseTile,
        backgroundSize: `${TILE}px ${TILE}px`,
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};
