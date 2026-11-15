/**
 * Accessoires propres à la vidéo 2 : phare, bouée, carte marine, épave,
 * poisson, munitions, casier, onde vocale.
 */
import { bodyFont, impactFont } from "../fonts";
import { palette } from "../theme";

const base = {
  stroke: palette.line,
  strokeWidth: 5,
  fill: palette.ink,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/** Phare sur son rocher. Placé par le milieu de sa base ; `sweep` en degrés. */
export const Lighthouse: React.FC<{
  x: number;
  y: number;
  h?: number;
  sweep: number;
  beam?: number;
}> = ({ x, y, h = 460, sweep, beam = 1 }) => {
  const w0 = h * 0.26;
  const w1 = h * 0.16;
  const lampY = -h - 40;
  const dir = Math.cos((sweep * Math.PI) / 180);
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Faisceau tournant */}
      {beam > 0 ? (
        <g
          transform={`translate(0 ${lampY}) scale(${dir} 1)`}
          opacity={beam * (0.35 + 0.65 * Math.abs(dir))}
          style={{ mixBlendMode: "screen" }}
          filter="url(#soft)"
        >
          <polygon
            points="0,-14 900,-150 900,150 0,14"
            fill="rgba(255, 220, 150, 0.35)"
          />
        </g>
      ) : null}
      {/* Rocher */}
      <path
        d={`M${-h * 0.5},0 C${-h * 0.42},-50 ${-h * 0.2},-70 0,-62 C${h * 0.2},-70 ${h * 0.42},-46 ${h * 0.5},0 Z`}
        {...base}
      />
      {/* Tour à bandes */}
      <path
        d={`M${-w0 / 2},-50 L${-w1 / 2},${-h} L${w1 / 2},${-h} L${w0 / 2},-50 Z`}
        {...base}
        filter="url(#glow)"
      />
      {[0.3, 0.55, 0.8].map((k) => {
        const yy = -50 - (h - 50) * k;
        const ww = w0 - (w0 - w1) * k;
        return (
          <rect
            key={k}
            x={-ww / 2}
            y={yy - 16}
            width={ww}
            height={32}
            fill={palette.inkLight}
            stroke={palette.lineSoft}
            strokeWidth={3}
          />
        );
      })}
      {/* Lanterne */}
      <rect
        x={-w1 / 2 - 14}
        y={-h - 8}
        width={w1 + 28}
        height={12}
        rx={4}
        {...base}
      />
      <rect
        x={-w1 / 2 + 4}
        y={lampY - 26}
        width={w1 - 8}
        height={44}
        rx={6}
        fill={palette.goldLight}
        filter="url(#glowStrong)"
      />
      <path
        d={`M${-w1 / 2 - 6},${lampY - 26} L0,${lampY - 70} L${w1 / 2 + 6},${lampY - 26} Z`}
        {...base}
      />
    </g>
  );
};

/** Bouée flottante. `bob` : décalage vertical (px). */
export const Buoy: React.FC<{
  x: number;
  y: number;
  bob: number;
  children?: React.ReactNode;
}> = ({ x, y, bob, children }) => (
  <g transform={`translate(${x} ${y + bob})`}>
    <line
      x1={0}
      y1={-60}
      x2={0}
      y2={-200}
      stroke={palette.line}
      strokeWidth={8}
    />
    <g transform="translate(0 -200)">{children}</g>
    <path d="M-80,0 C-80,-70 80,-70 80,0 Z" {...base} filter="url(#glow)" />
    <path d="M-60,-30 L60,-30" stroke={palette.lineSoft} strokeWidth={4} />
    <ellipse
      cx={0}
      cy={4}
      rx={110}
      ry={16}
      fill="none"
      stroke={palette.lineFaint}
      strokeWidth={3}
    />
  </g>
);

/** Île vue de dessus (forme organique). */
export const Island: React.FC<{
  x: number;
  y: number;
  s?: number;
  highlight?: number;
}> = ({ x, y, s = 1, highlight = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {highlight > 0 ? (
      <circle
        r={110}
        fill="none"
        stroke={palette.goldLight}
        strokeWidth={6}
        opacity={highlight}
        filter="url(#glow)"
      />
    ) : null}
    <path
      d="M-70,-10 C-60,-60 10,-70 50,-40 C90,-10 80,40 30,55 C-20,70 -80,40 -70,-10 Z"
      fill={palette.inkLight}
      stroke={palette.line}
      strokeWidth={4}
    />
    <path
      d="M-30,0 C-10,-20 20,-20 30,5"
      fill="none"
      stroke={palette.lineFaint}
      strokeWidth={3}
    />
    {/* Palmier */}
    <line
      x1={10}
      y1={10}
      x2={18}
      y2={-38}
      stroke={palette.line}
      strokeWidth={4}
    />
    <path
      d="M18,-38 C0,-50 -14,-42 -20,-30 M18,-38 C36,-52 50,-44 54,-32"
      fill="none"
      stroke={palette.line}
      strokeWidth={4}
    />
  </g>
);

/** Épave de navire (coque brisée et mât penché). */
export const Wreck: React.FC<{ x: number; y: number; s?: number }> = ({
  x,
  y,
  s = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-8)`}>
    <path d="M-80,0 L80,0 L60,34 L-60,34 Z" {...base} strokeWidth={4} />
    <path
      d="M-20,0 L-6,12 L8,-2 L22,10"
      fill="none"
      stroke={palette.line}
      strokeWidth={4}
    />
    <line
      x1={-10}
      y1={0}
      x2={-34}
      y2={-90}
      stroke={palette.line}
      strokeWidth={5}
    />
    <path
      d="M-30,-80 L10,-60 L-24,-46 Z"
      fill={palette.inkLight}
      stroke={palette.lineSoft}
      strokeWidth={3}
    />
  </g>
);

/** Poisson. `blink` : 0 → 1 ferme l'œil. */
export const Fish: React.FC<{
  x: number;
  y: number;
  s?: number;
  rotate?: number;
  blink?: number;
}> = ({ x, y, s = 1, rotate = 0, blink = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
    <path
      d="M-70,0 C-40,-46 40,-46 62,0 C40,46 -40,46 -70,0 Z"
      fill="#7fd6ff"
      stroke={palette.line}
      strokeWidth={4}
      filter="url(#glow)"
    />
    <path
      d="M62,0 L104,-34 L96,0 L104,34 Z"
      fill="#5cbde8"
      stroke={palette.line}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M-10,-20 C0,0 0,0 -10,20"
      fill="none"
      stroke="rgba(10,19,48,0.5)"
      strokeWidth={3}
    />
    <circle cx={-40} cy={-8} r={9} fill={palette.ink} />
    {blink < 0.5 ? (
      <circle cx={-37} cy={-11} r={3} fill="#fff" />
    ) : (
      <line
        x1={-48}
        y1={-8}
        x2={-32}
        y2={-8}
        stroke={palette.ink}
        strokeWidth={4}
      />
    )}
    <path
      d="M-66,6 C-60,10 -54,10 -50,8"
      fill="none"
      stroke={palette.ink}
      strokeWidth={3}
    />
  </g>
);

/** Munitions (trois balles). */
export const Ammo: React.FC<{ x: number; y: number; s?: number }> = ({
  x,
  y,
  s = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-34, 0, 34].map((dx) => (
      <g key={dx} transform={`translate(${dx} 0)`}>
        <rect
          x={-11}
          y={-20}
          width={22}
          height={50}
          rx={4}
          fill="#d9a441"
          stroke={palette.line}
          strokeWidth={3}
        />
        <path
          d="M-11,-20 C-11,-48 11,-48 11,-20 Z"
          fill="#c9d3ee"
          stroke={palette.line}
          strokeWidth={3}
        />
      </g>
    ))}
  </g>
);

/** Casier métallique. `open` : 0 fermé → 1 ouvert ; `light` : lueur dorée. */
export const Locker: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  open?: number;
  name: string;
  hero?: boolean;
  children?: React.ReactNode;
}> = ({ x, y, w = 190, h = 420, open = 0, name, hero = false, children }) => {
  const doorW = w * (1 - 0.85 * open);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={10}
        fill={palette.night}
        stroke={palette.line}
        strokeWidth={5}
      />
      {open > 0.05 ? (
        <g opacity={Math.min(1, open * 1.5)}>
          <rect
            x={-w / 2 + 8}
            y={-h + 8}
            width={w - 16}
            height={h - 16}
            fill="url(#goldHalo)"
          />
          {children}
        </g>
      ) : null}
      {/* Porte (pivote sur la gauche) */}
      <g>
        <rect
          x={-w / 2}
          y={-h}
          width={doorW}
          height={h}
          rx={10}
          {...base}
          stroke={hero ? palette.hero : palette.line}
          filter="url(#glow)"
        />
        {open < 0.8
          ? [0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1={-w / 2 + doorW * 0.25}
                y1={-h + 40 + i * 18}
                x2={-w / 2 + doorW * 0.75}
                y2={-h + 40 + i * 18}
                stroke={palette.lineSoft}
                strokeWidth={4}
              />
            ))
          : null}
        {open < 0.8 ? (
          <rect
            x={-w / 2 + doorW - 30}
            y={-h / 2 - 20}
            width={10}
            height={40}
            rx={5}
            fill={palette.line}
          />
        ) : null}
      </g>
      <text
        y={34}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={26}
        fill={hero ? palette.hero : palette.lineSoft}
      >
        {name}
      </text>
    </g>
  );
};

/** Onde vocale (barres). `level` : 0 silence → 1 parole. */
export const VoiceWave: React.FC<{
  x: number;
  y: number;
  t: number;
  level: number;
  seed: number;
  color?: string;
}> = ({ x, y, t, level, seed, color = palette.hero }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 9 }, (_, i) => {
      const v = Math.abs(Math.sin(t * (6 + (i % 3)) + i * 1.7 + seed)) * level;
      const hh = 6 + v * 46;
      return (
        <rect
          key={i}
          x={-58 + i * 14}
          y={-hh / 2}
          width={8}
          height={hh}
          rx={4}
          fill={color}
          opacity={0.5 + 0.5 * level}
        />
      );
    })}
  </g>
);

/** Grand écran de jeu (bouton JOUER, puis carte de mission). */
export const GameScreen: React.FC<{
  x: number;
  y: number;
  crossed: number;
  mission: number;
}> = ({ x, y, crossed, mission }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      x={-330}
      y={-210}
      width={660}
      height={420}
      rx={26}
      {...base}
      strokeWidth={7}
      filter="url(#glow)"
    />
    <rect x={-300} y={-180} width={600} height={360} rx={12} fill="#0d1a40" />
    {mission < 1 ? (
      <g opacity={1 - mission}>
        <rect
          x={-150}
          y={-46}
          width={300}
          height={92}
          rx={46}
          fill={palette.inkLight}
          stroke={palette.line}
          strokeWidth={5}
        />
        <text
          y={18}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={52}
          fill={palette.line}
        >
          JOUER
        </text>
        {crossed > 0 ? (
          <line
            x1={-170}
            y1={60}
            x2={-170 + 340 * crossed}
            y2={60 - 120 * crossed}
            stroke="#ff6b5a"
            strokeWidth={12}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        ) : null}
      </g>
    ) : null}
    {mission > 0 ? (
      <g opacity={mission}>
        <Island x={-160} y={20} s={0.9} />
        <Island x={150} y={-50} s={0.7} />
        <path
          d="M-120,40 C-40,120 40,-140 120,-40"
          fill="none"
          stroke={palette.goldLight}
          strokeWidth={5}
          strokeDasharray="14 12"
        />
        <path
          d="M110,-56 l24,24 m0,-24 l-24,24"
          stroke="#ff6b5a"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <text
          y={150}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={46}
          letterSpacing={8}
          fill={palette.gold}
          filter="url(#glow)"
        >
          MISSION
        </text>
      </g>
    ) : null}
  </g>
);
