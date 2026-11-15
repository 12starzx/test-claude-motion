/**
 * Univers de la vidéo 4 : coucher de soleil façon « Vice City » (ciel
 * dégradé, soleil à bandes, palmiers, néons) et accessoires dédiés.
 * Aucun logo ni personnage officiel : silhouettes et typographie maison.
 */
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bodyFont, impactFont } from "../fonts";
import { Stage } from "../lib/scene";
import { palette, VIDEO } from "../theme";
import { Stars } from "../components/art/Environment";

export const neon = {
  pink: "#ff4fa3",
  cyan: palette.hero,
  sun: "#ffb35c",
  coral: "#ff6f61",
  dusk: "#140a2c",
  silhouette: "#12081f",
} as const;

/** Ciel de coucher de soleil, permanent sous toutes les scènes. */
export const SunsetBackdrop: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #0d0724 0%, #261046 28%, #5e1d63 48%, #b93a72 62%, #ff6f61 74%, #ffb35c 82%, #2a1238 82.5%, #12081f 100%)",
      }}
    >
      <Stage>
        <defs>
          <linearGradient id="sunFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe08a" />
            <stop offset="60%" stopColor="#ff8a5c" />
            <stop offset="100%" stopColor="#ff4fa3" />
          </linearGradient>
          <clipPath id="sunClip">
            <rect x={0} y={0} width={1080} height={1584} />
          </clipPath>
        </defs>
        <Stars
          t={t}
          count={50}
          area={[0, 0, 1080, 700]}
          seed="dusk"
          opacity={0.5}
        />
        <g clipPath="url(#sunClip)">
          <circle
            cx={540}
            cy={1500}
            r={300}
            fill="url(#sunFill)"
            opacity={0.95}
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={200}
              y={1330 + i * 38 + ((t * 12) % 38)}
              width={680}
              height={6 + i * 2.2}
              fill="#b93a72"
            />
          ))}
        </g>
        {/* Horizon et reflets */}
        <line
          x1={0}
          y1={1584}
          x2={1080}
          y2={1584}
          stroke="#ffd0a0"
          strokeWidth={3}
          opacity={0.7}
        />
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={540 - (220 - i * 22)}
            y={1600 + i * 26}
            width={(220 - i * 22) * 2}
            height={5}
            rx={2.5}
            fill="#ff8a5c"
            opacity={0.35 - i * 0.035}
          />
        ))}
      </Stage>
    </AbsoluteFill>
  );
};

/** Palmier en silhouette. Placé par le pied du tronc. */
export const Palm: React.FC<{
  x: number;
  y: number;
  h?: number;
  flip?: boolean;
  sway?: number;
}> = ({ x, y, h = 520, flip = false, sway = 0 }) => {
  const topX = (flip ? -1 : 1) * h * 0.22 + sway;
  const topY = -h;
  const fronds = [-150, -110, -60, -20, 20, 60, 110, 150];
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M-12,0 C${topX * 0.2 - 14},${topY * 0.5} ${topX * 0.7 - 6},${topY * 0.85} ${topX - 4},${topY} L${topX + 6},${topY} C${topX * 0.7 + 8},${topY * 0.85} ${topX * 0.2 + 14},${topY * 0.5} 12,0 Z`}
        fill={neon.silhouette}
      />
      {fronds.map((a) => {
        const rad = (a * Math.PI) / 180;
        const len = h * 0.42;
        const ex = topX + Math.sin(rad) * len;
        const ey = topY + Math.cos(rad) * len * 0.55 - len * 0.25;
        return (
          <path
            key={a}
            d={`M${topX},${topY} Q${topX + Math.sin(rad) * len * 0.5},${topY - len * 0.35} ${ex},${ey}`}
            fill="none"
            stroke={neon.silhouette}
            strokeWidth={22}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** Ligne d'immeubles en silhouette, fenêtres et liserés néon. */
export const Skyline: React.FC<{ y: number; t: number; lit?: number }> = ({
  y,
  t,
  lit = 1,
}) => {
  const blocks = [
    [20, 260, 120],
    [150, 380, 100],
    [260, 300, 90],
    [360, 520, 130],
    [500, 340, 100],
    [610, 460, 120],
    [740, 300, 90],
    [840, 420, 110],
    [960, 280, 120],
  ];
  return (
    <g>
      {blocks.map(([bx, bh, bw], i) => (
        <g key={i}>
          <rect
            x={bx}
            y={y - bh}
            width={bw}
            height={bh}
            fill={neon.silhouette}
          />
          <line
            x1={bx}
            y1={y - bh}
            x2={bx + bw}
            y2={y - bh}
            stroke={i % 2 ? neon.pink : neon.cyan}
            strokeWidth={4}
            opacity={0.8 * lit}
            filter="url(#glow)"
          />
          {Array.from({ length: Math.floor(bh / 40) }, (_, r) =>
            Array.from({ length: Math.floor(bw / 30) }, (_, c) => {
              const on =
                Math.sin(i * 7 + r * 3 + c * 5 + Math.floor(t * 0.5)) > 0.2;
              return on ? (
                <rect
                  key={`${r}-${c}`}
                  x={bx + 10 + c * 30}
                  y={y - bh + 18 + r * 40}
                  width={12}
                  height={16}
                  fill={neon.sun}
                  opacity={0.55 * lit}
                />
              ) : null;
            }),
          )}
        </g>
      ))}
    </g>
  );
};

/** Téléviseur cathodique. Le contenu de l'écran est passé en enfants. */
export const RetroTV: React.FC<{
  x: number;
  y: number;
  s?: number;
  children?: React.ReactNode;
}> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect
      x={-260}
      y={-200}
      width={520}
      height={400}
      rx={40}
      fill={neon.silhouette}
      stroke={palette.line}
      strokeWidth={6}
      filter="url(#glow)"
    />
    <rect x={-220} y={-165} width={380} height={330} rx={30} fill="#1a2a5a" />
    <g>{children}</g>
    <circle
      cx={205}
      cy={-100}
      r={18}
      fill="none"
      stroke={palette.lineSoft}
      strokeWidth={4}
    />
    <circle
      cx={205}
      cy={-40}
      r={18}
      fill="none"
      stroke={palette.lineSoft}
      strokeWidth={4}
    />
    <line
      x1={-140}
      y1={200}
      x2={-170}
      y2={250}
      stroke={palette.line}
      strokeWidth={8}
    />
    <line
      x1={140}
      y1={200}
      x2={170}
      y2={250}
      stroke={palette.line}
      strokeWidth={8}
    />
  </g>
);

/** Boîte de jeu générique (titre en typographie maison). */
export const GameBox: React.FC<{
  x: number;
  y: number;
  s?: number;
  title: string;
  rotate?: number;
}> = ({ x, y, s = 1, title, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
    <rect
      x={-110}
      y={-150}
      width={220}
      height={300}
      rx={12}
      fill="#1b1030"
      stroke={palette.line}
      strokeWidth={5}
      filter="url(#glow)"
    />
    <rect
      x={-110}
      y={-150}
      width={220}
      height={60}
      rx={12}
      fill={neon.pink}
      opacity={0.85}
    />
    <text
      y={-108}
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={34}
      fill="#fff"
    >
      {title}
    </text>
    <circle cx={0} cy={40} r={70} fill={neon.sun} opacity={0.8} />
    <path d="M-90,120 L-40,60 L0,100 L50,40 L90,120 Z" fill={neon.silhouette} />
  </g>
);

/** Compteur de vues qui défile jusqu'à `value`. */
export const ViewCounter: React.FC<{
  x: number;
  y: number;
  value: number;
  label?: string;
  size?: number;
}> = ({ x, y, value, label = "vues", size = 92 }) => (
  <g transform={`translate(${x} ${y})`}>
    <text
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={size}
      fill="#fff"
      filter="url(#glow)"
    >
      {Math.round(value).toLocaleString("fr-FR")}
    </text>
    <text
      y={size * 0.62}
      textAnchor="middle"
      fontFamily={bodyFont}
      fontWeight={600}
      fontSize={size * 0.36}
      fill={palette.lineSoft}
    >
      {label}
    </text>
  </g>
);

/** Tampon « REPORTÉ ». */
export const Stamp: React.FC<{
  x: number;
  y: number;
  p: number;
  text?: string;
  color?: string;
}> = ({ x, y, p, text = "REPORTÉ", color = "#ff4f5e" }) =>
  p > 0 ? (
    <g
      transform={`translate(${x} ${y}) rotate(-14) scale(${2.2 - 1.2 * p})`}
      opacity={Math.min(1, p * 1.4)}
    >
      <rect
        x={-170}
        y={-50}
        width={340}
        height={100}
        rx={14}
        fill="none"
        stroke={color}
        strokeWidth={9}
      />
      <text
        y={26}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={66}
        letterSpacing={6}
        fill={color}
      >
        {text}
      </text>
    </g>
  ) : null;

/** Voiture de sport générique, de profil. */
export const Car: React.FC<{ x: number; y: number; s?: number }> = ({
  x,
  y,
  s = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M-200,-20 C-190,-60 -120,-70 -60,-72 C-20,-110 70,-110 110,-70 C160,-66 200,-50 210,-20 L210,0 L-200,0 Z"
      fill={neon.silhouette}
      stroke={neon.pink}
      strokeWidth={4}
      filter="url(#glow)"
    />
    <path
      d="M-40,-72 C-10,-100 60,-100 90,-72 Z"
      fill="#2a1a4a"
      stroke={palette.lineSoft}
      strokeWidth={3}
    />
    {[-120, 130].map((wx) => (
      <circle
        key={wx}
        cx={wx}
        cy={0}
        r={34}
        fill={neon.silhouette}
        stroke={palette.line}
        strokeWidth={5}
      />
    ))}
    <rect
      x={190}
      y={-40}
      width={22}
      height={10}
      rx={4}
      fill={neon.sun}
      filter="url(#glowStrong)"
    />
  </g>
);

/** Panneau routier vert (lettrage maison). */
export const RoadSign: React.FC<{
  x: number;
  y: number;
  text: string;
  sub?: string;
  s?: number;
}> = ({ x, y, text, sub, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line
      x1={-120}
      y1={0}
      x2={-120}
      y2={260}
      stroke={palette.line}
      strokeWidth={10}
    />
    <line
      x1={120}
      y1={0}
      x2={120}
      y2={260}
      stroke={palette.line}
      strokeWidth={10}
    />
    <rect
      x={-210}
      y={-110}
      width={420}
      height={150}
      rx={18}
      fill="#0e6b4a"
      stroke="#e8f5ef"
      strokeWidth={7}
      filter="url(#glow)"
    />
    <text
      y={-28}
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={62}
      letterSpacing={4}
      fill="#e8f5ef"
    >
      {text}
    </text>
    {sub ? (
      <text
        y={18}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={30}
        fill="#e8f5ef"
      >
        {sub}
      </text>
    ) : null}
  </g>
);
