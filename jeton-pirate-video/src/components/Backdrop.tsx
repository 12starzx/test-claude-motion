/**
 * Fond permanent (dégradé bleu nuit, ciel étoilé discret) et finitions
 * de surface (vignette, grain), communs à toutes les scènes.
 */
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { palette, VIDEO } from "../theme";
import { Stars } from "./art/Environment";
import { Stage } from "../lib/scene";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 70% at 50% 38%, ${palette.deep} 0%, ${palette.navy} 45%, ${palette.night} 100%)`,
      }}
    >
      <Stage>
        <Stars
          t={t}
          count={70}
          area={[0, 0, 1080, 1400]}
          seed="sky"
          opacity={0.45}
        />
      </Stage>
    </AbsoluteFill>
  );
};

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/></filter><rect width="300" height="300" filter="url(#n)"/></svg>`,
);

export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`gx-${frame}`) * 300);
  const oy = Math.floor(random(`gy-${frame}`) * 300);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(90% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(1,3,10,0.75) 100%)",
        }}
      />
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      >
        <defs>
          <pattern
            id="grain"
            width={300}
            height={300}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${ox} ${oy})`}
          >
            <image
              href={`data:image/svg+xml,${GRAIN_SVG}`}
              width={300}
              height={300}
            />
          </pattern>
        </defs>
        <rect width={VIDEO.width} height={VIDEO.height} fill="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
