/**
 * Éléments de décor réutilisés par plusieurs scènes.
 */
import { palette } from "../theme";
import { GroundMist } from "../components/art/Environment";

/** Sol d'intérieur : ligne lumineuse et brume. */
export const Floor: React.FC<{ y: number; t: number }> = ({ y, t }) => (
  <g>
    <rect
      x={-100}
      y={y}
      width={1280}
      height={1920 - y}
      fill={palette.night}
      opacity={0.55}
    />
    <line
      x1={-100}
      y1={y}
      x2={1180}
      y2={y}
      stroke={palette.lineFaint}
      strokeWidth={3}
    />
    <GroundMist y={y} t={t} />
  </g>
);

/** Plage : dune de sable au premier plan, liseré clair. */
export const Beach: React.FC<{ y: number; t: number; tilt?: number }> = ({
  y,
  t,
  tilt = 0,
}) => {
  const d = `M-100,${y + 30 + tilt} C200,${y - 20 + tilt} 520,${y + 10} 760,${y - 10} C920,${y - 24 - tilt} 1060,${y - 4 - tilt} 1180,${y + 6 - tilt} L1180,1920 L-100,1920 Z`;
  return (
    <g>
      <path d={d} fill="#060b1d" />
      <path
        d={d}
        fill="none"
        stroke={palette.lineSoft}
        strokeWidth={3}
        filter="url(#glow)"
      />
      <GroundMist y={y + 20} t={t} opacity={0.8} />
    </g>
  );
};

/** Badge numérique arrondi (compteur, affichage digital). */
export const Badge: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
  gold?: boolean;
  opacity?: number;
  scale?: number;
}> = ({ x, y, w, h, children, gold = false, opacity = 1, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      rx={Math.min(28, h / 3)}
      fill={palette.ink}
      stroke={gold ? palette.goldLight : palette.line}
      strokeWidth={6}
      filter="url(#glow)"
    />
    {children}
  </g>
);
