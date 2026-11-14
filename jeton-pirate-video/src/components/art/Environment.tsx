/**
 * Éléments d'atmosphère : faisceaux de lune, flaques de lumière, étoiles,
 * lune, mer, poussières et gerbes de particules.
 */
import { random } from "remotion";
import { clamp01, easeOut } from "../../lib/anim";
import { palette } from "../../theme";

/** Faisceau lumineux tombant du haut du cadre. */
export const Beam: React.FC<{
  x: number;
  y?: number;
  top?: number;
  bottom?: number;
  height?: number;
  angle?: number;
  opacity?: number;
}> = ({
  x,
  y = -80,
  top = 120,
  bottom = 620,
  height = 1500,
  angle = 0,
  opacity = 1,
}) => (
  <g
    transform={`rotate(${angle} ${x} ${y})`}
    opacity={opacity}
    filter="url(#soft)"
    style={{ mixBlendMode: "screen" }}
  >
    <polygon
      points={`${x - top / 2},${y} ${x + top / 2},${y} ${x + bottom / 2},${
        y + height
      } ${x - bottom / 2},${y + height}`}
      fill="url(#beamFill)"
    />
    <polygon
      points={`${x - top / 5},${y} ${x + top / 5},${y} ${x + bottom / 4},${
        y + height * 0.9
      } ${x - bottom / 4},${y + height * 0.9}`}
      fill="url(#beamFill)"
      opacity={0.6}
    />
  </g>
);

/** Flaque de lumière au sol, sous un faisceau. */
export const Pool: React.FC<{
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  opacity?: number;
  gold?: boolean;
}> = ({ x, y, rx = 300, ry = 70, opacity = 1, gold = false }) => (
  <ellipse
    cx={x}
    cy={y}
    rx={rx}
    ry={ry}
    fill={gold ? "url(#goldHalo)" : "url(#poolFill)"}
    opacity={opacity}
  />
);

/** Champ d'étoiles scintillantes (positions déterministes). */
export const Stars: React.FC<{
  t: number;
  count?: number;
  area?: [number, number, number, number];
  seed?: string;
  opacity?: number;
}> = ({
  t,
  count = 60,
  area = [0, 0, 1080, 900],
  seed = "stars",
  opacity = 1,
}) => {
  const [x0, y0, w, h] = area;
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const x = x0 + random(`${seed}-x-${i}`) * w;
        const y = y0 + random(`${seed}-y-${i}`) * h;
        const r = 1 + random(`${seed}-r-${i}`) * 2.2;
        const tw =
          0.35 +
          0.65 *
            (0.5 + 0.5 * Math.sin(t * (1 + random(`${seed}-s-${i}`) * 2) + i));
        return (
          <circle key={i} cx={x} cy={y} r={r} fill="#dfe8ff" opacity={tw} />
        );
      })}
    </g>
  );
};

/** Lune en croissant avec halo. */
export const Moon: React.FC<{
  x: number;
  y: number;
  r?: number;
  opacity?: number;
}> = ({ x, y, r = 46, opacity = 1 }) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r * 3.2} fill="url(#poolFill)" opacity={0.6} />
    <circle cx={x} cy={y} r={r} fill="#eef3ff" filter="url(#glow)" />
    <circle
      cx={x + r * 0.42}
      cy={y - r * 0.22}
      r={r * 0.86}
      fill={palette.navy}
    />
  </g>
);

/** Mer de nuit : horizon, vagues animées, reflet de lune. */
export const Sea: React.FC<{
  t: number;
  horizon: number;
  moonX?: number;
  opacity?: number;
}> = ({ t, horizon, moonX = 760, opacity = 1 }) => {
  const rows = 9;
  return (
    <g opacity={opacity}>
      <rect
        x={-100}
        y={horizon - 260}
        width={1280}
        height={260}
        fill="url(#skyGlow)"
      />
      <rect
        x={-100}
        y={horizon}
        width={1280}
        height={1920 - horizon}
        fill="url(#seaFill)"
      />
      <line
        x1={-100}
        y1={horizon}
        x2={1180}
        y2={horizon}
        stroke={palette.lineSoft}
        strokeWidth={2}
      />
      {Array.from({ length: rows }, (_, i) => {
        const y = horizon + 18 + i * i * 9 + i * 14;
        const amp = 3 + i * 1.6;
        const len = 120 + i * 30;
        const phase = t * (0.8 + i * 0.15) + i;
        let d = "";
        for (let x = -100; x <= 1180; x += 20) {
          const yy = y + Math.sin(x / len + phase) * amp;
          d += `${x === -100 ? "M" : "L"}${x},${yy.toFixed(1)} `;
        }
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={palette.line}
            strokeWidth={1.5 + i * 0.25}
            opacity={0.07 + i * 0.025}
          />
        );
      })}
      {/* Reflet de lune : tirets qui scintillent. */}
      {Array.from({ length: 14 }, (_, i) => {
        const y = horizon + 14 + i * 22;
        const w = 30 + i * 9 + Math.sin(t * 3 + i) * 10;
        return (
          <rect
            key={`r-${i}`}
            x={moonX - w / 2 + Math.sin(t * 1.7 + i * 1.3) * 12}
            y={y}
            width={w}
            height={3}
            rx={1.5}
            fill="#eef3ff"
            opacity={0.32 - i * 0.018}
          />
        );
      })}
    </g>
  );
};

/** Poussières flottant lentement dans la lumière. */
export const Dust: React.FC<{
  t: number;
  count?: number;
  area?: [number, number, number, number];
  seed?: string;
  color?: string;
  opacity?: number;
}> = ({
  t,
  count = 40,
  area = [240, 300, 600, 1300],
  seed = "dust",
  color = "#dfe8ff",
  opacity = 1,
}) => {
  const [x0, y0, w, h] = area;
  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const speed = 8 + random(`${seed}-v-${i}`) * 22;
        const x =
          x0 + random(`${seed}-x-${i}`) * w + Math.sin(t * 0.6 + i) * 14;
        const y =
          y0 + ((((random(`${seed}-y-${i}`) * h - t * speed) % h) + h) % h);
        const r = 1.2 + random(`${seed}-r-${i}`) * 2.4;
        const a = 0.25 + 0.5 * random(`${seed}-a-${i}`);
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={a} />;
      })}
    </g>
  );
};

/**
 * Gerbe de particules dorées (désintégration du jeton, éclat d'ouverture).
 * `elapsed` : temps (s) écoulé depuis le déclenchement.
 */
export const Burst: React.FC<{
  x: number;
  y: number;
  elapsed: number;
  count?: number;
  spread?: number;
  rise?: number;
  duration?: number;
  seed?: string;
  color?: string;
}> = ({
  x,
  y,
  elapsed,
  count = 70,
  spread = 260,
  rise = 220,
  duration = 1.6,
  seed = "burst",
  color = palette.goldLight,
}) => {
  if (elapsed < 0 || elapsed > duration) {
    return null;
  }
  const p = clamp01(elapsed / duration);
  const travel = easeOut(p);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = random(`${seed}-a-${i}`) * Math.PI * 2;
        const dist = (0.25 + random(`${seed}-d-${i}`) * 0.75) * spread;
        const px = x + Math.cos(angle) * dist * travel;
        const py =
          y +
          Math.sin(angle) * dist * travel * 0.8 -
          rise * p * random(`${seed}-u-${i}`);
        const r = (1.5 + random(`${seed}-r-${i}`) * 3.5) * (1 - p * 0.6);
        const flick = 0.6 + 0.4 * Math.sin(elapsed * 18 + i);
        return (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={r}
            fill={color}
            opacity={(1 - p) * flick}
          />
        );
      })}
    </g>
  );
};

/** Sol brumeux : bandes floues au bas d'une scène. */
export const GroundMist: React.FC<{
  y: number;
  t: number;
  opacity?: number;
}> = ({ y, t, opacity = 1 }) => (
  <g filter="url(#haze)" opacity={opacity}>
    <ellipse
      cx={300 + Math.sin(t * 0.3) * 40}
      cy={y + 40}
      rx={420}
      ry={70}
      fill="rgba(120,150,220,0.16)"
    />
    <ellipse
      cx={800 + Math.cos(t * 0.25) * 50}
      cy={y + 70}
      rx={460}
      ry={80}
      fill="rgba(120,150,220,0.12)"
    />
    <ellipse cx={540} cy={y + 150} rx={700} ry={120} fill="rgba(5,9,22,0.7)" />
  </g>
);
