/**
 * Personnages (silhouettes articulées) et jeton.
 */
import { impactFont } from "../../fonts";
import { palette } from "../../theme";

/* ------------------------------------------------------------------ */
/* Silhouette articulée                                                */
/* ------------------------------------------------------------------ */

/** Angles absolus (degrés) de chaque segment : 0 = vers le bas, + = vers l'avant. */
export type Pose = {
  armL: [number, number];
  armR: [number, number];
  legL: [number, number];
  legR: [number, number];
  /** Inclinaison du buste (degrés, + = vers l'avant). */
  lean: number;
  /** Inclinaison de la tête (degrés). */
  nod: number;
};

const SEG = {
  head: 19,
  neck: 12,
  torso: 74,
  upperArm: 42,
  foreArm: 40,
  thigh: 48,
  shin: 46,
} as const;

/** Hauteur hanche → sol d'une silhouette debout (échelle 1). */
export const LEG = SEG.thigh + SEG.shin;

export const STAND: Pose = {
  armL: [-12, -6],
  armR: [12, 6],
  legL: [-7, -3],
  legR: [7, 3],
  lean: 0,
  nod: 0,
};

export const SIT: Pose = {
  armL: [25, 80],
  armR: [30, 85],
  legL: [88, 2],
  legR: [92, 6],
  lean: 8,
  nod: 6,
};

/** Cycle de marche (phase en tours). */
export const walkPose = (phase: number, stride = 26): Pose => {
  const s = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  return {
    armL: [-s * stride * 0.8, -s * stride * 0.8 + 18],
    armR: [s * stride * 0.8, s * stride * 0.8 + 18],
    legL: [s * stride, s * stride - Math.max(0, c) * 22],
    legR: [-s * stride, -s * stride - Math.max(0, -c) * 22],
    lean: 6,
    nod: 0,
  };
};

/** Mélange de deux poses (p : 0 → a, 1 → b). */
export const blendPose = (a: Pose, b: Pose, p: number): Pose => {
  const m = (x: number, y: number) => x + (y - x) * p;
  const pair = (x: [number, number], y: [number, number]): [number, number] => [
    m(x[0], y[0]),
    m(x[1], y[1]),
  ];
  return {
    armL: pair(a.armL, b.armL),
    armR: pair(a.armR, b.armR),
    legL: pair(a.legL, b.legL),
    legR: pair(a.legR, b.legR),
    lean: m(a.lean, b.lean),
    nod: m(a.nod, b.nod),
  };
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const step = (
  [x, y]: [number, number],
  angle: number,
  length: number,
): [number, number] => [
  x + Math.sin(rad(angle)) * length,
  y + Math.cos(rad(angle)) * length,
];

/**
 * Silhouette placée par sa hanche (x, y).
 * Pour une silhouette debout sur un sol à `ground` : y = ground - LEG * scale.
 */
export const Figure: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose?: Pose;
  color?: string;
  hero?: boolean;
  facing?: 1 | -1;
  rotate?: number;
  opacity?: number;
}> = ({
  x,
  y,
  scale = 1,
  pose = STAND,
  color,
  hero = false,
  facing = 1,
  rotate = 0,
  opacity = 1,
}) => {
  const stroke = color ?? (hero ? palette.hero : palette.mate);
  const hip: [number, number] = [0, 0];
  const shoulder: [number, number] = [
    Math.sin(rad(pose.lean)) * SEG.torso,
    -Math.cos(rad(pose.lean)) * SEG.torso,
  ];
  const neckTop: [number, number] = [
    shoulder[0] + Math.sin(rad(pose.lean + pose.nod)) * SEG.neck,
    shoulder[1] - Math.cos(rad(pose.lean + pose.nod)) * SEG.neck,
  ];
  const head: [number, number] = [
    neckTop[0] + Math.sin(rad(pose.lean + pose.nod)) * SEG.head,
    neckTop[1] - Math.cos(rad(pose.lean + pose.nod)) * SEG.head,
  ];
  const limb = (
    origin: [number, number],
    [a, b]: [number, number],
    l1: number,
    l2: number,
  ) => {
    const joint = step(origin, a, l1);
    const end = step(joint, b, l2);
    return `M${origin[0]},${origin[1]} L${joint[0]},${joint[1]} L${end[0]},${end[1]}`;
  };
  const strokeWidth = 10;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${facing * scale} ${scale})`}
      opacity={opacity}
      filter={hero ? "url(#glow)" : undefined}
    >
      <g
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={limb(hip, pose.legL, SEG.thigh, SEG.shin)} opacity={0.85} />
        <path
          d={limb(shoulder, pose.armL, SEG.upperArm, SEG.foreArm)}
          opacity={0.85}
        />
        <path d={`M${hip[0]},${hip[1]} L${neckTop[0]},${neckTop[1]}`} />
        <path d={limb(hip, pose.legR, SEG.thigh, SEG.shin)} />
        <path d={limb(shoulder, pose.armR, SEG.upperArm, SEG.foreArm)} />
      </g>
      <circle cx={head[0]} cy={head[1]} r={SEG.head} fill={stroke} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Jeton                                                               */
/* ------------------------------------------------------------------ */

const starPoint = (angle: number, length: number, width: number) => {
  const a = rad(angle);
  const tip: [number, number] = [Math.sin(a) * length, -Math.cos(a) * length];
  const left: [number, number] = [
    Math.sin(a - Math.PI / 2) * width,
    -Math.cos(a - Math.PI / 2) * width,
  ];
  const right: [number, number] = [-left[0], -left[1]];
  return { tip, left, right };
};

/**
 * Jeton pirate : pièce dorée sur une rose des vents.
 * `glow` règle le halo, `spin` la rotation de la rose (degrés),
 * `flip` simule une pièce qui tourne sur elle-même (-1 → 1).
 */
export const Token: React.FC<{
  x: number;
  y: number;
  r?: number;
  glow?: number;
  spin?: number;
  flip?: number;
  opacity?: number;
  rays?: number;
}> = ({
  x,
  y,
  r = 120,
  glow = 1,
  spin = 0,
  flip = 1,
  opacity = 1,
  rays = 0,
}) => {
  const long = [0, 90, 180, 270].map((a) =>
    starPoint(a + spin, r * 1.55, r * 0.26),
  );
  const short = [45, 135, 225, 315].map((a) =>
    starPoint(a + spin, r * 1.2, r * 0.17),
  );
  const facet = (p: ReturnType<typeof starPoint>, key: string) => (
    <g key={key}>
      <polygon
        points={`0,0 ${p.left[0]},${p.left[1]} ${p.tip[0]},${p.tip[1]}`}
        fill={palette.goldLight}
      />
      <polygon
        points={`0,0 ${p.right[0]},${p.right[1]} ${p.tip[0]},${p.tip[1]}`}
        fill={palette.goldDeep}
      />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {glow > 0 ? (
        <circle
          r={r * 3}
          fill="url(#goldHalo)"
          opacity={glow}
          style={{ mixBlendMode: "screen" }}
        />
      ) : null}
      {rays > 0 ? (
        <g opacity={rays} style={{ mixBlendMode: "screen" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = rad(i * 30 + spin * 0.4);
            const w = rad(1.8);
            const L = r * 3.6;
            return (
              <polygon
                key={i}
                points={`0,0 ${Math.sin(a - w) * L},${-Math.cos(a - w) * L} ${Math.sin(a + w) * L},${-Math.cos(a + w) * L}`}
                fill="rgba(255, 222, 160, 0.13)"
              />
            );
          })}
        </g>
      ) : null}
      <g transform={`scale(${flip} 1)`}>
        {short.map((p, i) => facet(p, `s${i}`))}
        {long.map((p, i) => facet(p, `l${i}`))}
        <circle r={r * 1.0} fill="url(#coinRim)" />
        <circle r={r * 0.84} fill="url(#coinFace)" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = rad(i * 15);
          return (
            <circle
              key={i}
              cx={Math.sin(a) * r * 0.92}
              cy={-Math.cos(a) * r * 0.92}
              r={r * 0.028}
              fill="#fff1c9"
              opacity={0.85}
            />
          );
        })}
        <circle
          r={r * 0.84}
          fill="none"
          stroke="#fff1c9"
          strokeWidth={r * 0.025}
          opacity={0.6}
        />
        {/* Facettes du disque */}
        <polygon
          points={`0,${-r * 0.84} ${r * 0.73},${-r * 0.42} 0,0`}
          fill="#fff6dd"
          opacity={0.18}
        />
        <polygon
          points={`0,${r * 0.84} ${-r * 0.73},${r * 0.42} 0,0`}
          fill="#7a2c05"
          opacity={0.16}
        />
        <text
          x={r * 0.04}
          y={r * 0.36}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={r * 1.05}
          fill="#fff4d8"
          stroke={palette.goldDeep}
          strokeWidth={r * 0.05}
          paintOrder="stroke"
          transform={`skewX(-6)`}
        >
          F
        </text>
      </g>
    </g>
  );
};
