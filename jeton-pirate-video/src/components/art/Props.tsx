/**
 * Accessoires et décors au trait : calendrier, coffre, manette, téléphone,
 * mobilier, hublot, sablier, horloge, bulles, cartes d'équipe, livres.
 *
 * Convention : trait clair (palette.line), remplissage bleu nuit (palette.ink)
 * pour masquer ce qui se trouve derrière.
 */
import { bodyFont, impactFont } from "../../fonts";
import { palette } from "../../theme";

const base = {
  stroke: palette.line,
  strokeWidth: 5,
  fill: palette.ink,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/* ------------------------------------------------------------------ */

/** Feuillet de calendrier « DÉC » avec le jour. Placé par son centre. */
export const CalendarCard: React.FC<{
  x: number;
  y: number;
  day: number | string;
  w?: number;
  month?: string;
  opacity?: number;
  rotate?: number;
  highlight?: boolean;
}> = ({
  x,
  y,
  day,
  w = 220,
  month = "DÉC",
  opacity = 1,
  rotate = 0,
  highlight = false,
}) => {
  const h = w * 0.82;
  const color = highlight ? palette.goldLight : palette.line;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={w * 0.1}
        {...base}
        stroke={color}
        strokeWidth={w * 0.026}
        filter="url(#glow)"
      />
      <line
        x1={-w / 2}
        y1={-h / 2 + h * 0.28}
        x2={w / 2}
        y2={-h / 2 + h * 0.28}
        stroke={color}
        strokeWidth={w * 0.018}
      />
      {[-0.26, 0.26].map((k) => (
        <line
          key={k}
          x1={k * w}
          y1={-h / 2 - h * 0.08}
          x2={k * w}
          y2={-h / 2 + h * 0.08}
          stroke={color}
          strokeWidth={w * 0.03}
          strokeLinecap="round"
        />
      ))}
      <text
        y={-h / 2 + h * 0.2}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={800}
        fontSize={w * 0.11}
        letterSpacing={w * 0.012}
        fill={color}
      >
        {month}
      </text>
      <text
        y={h * 0.33}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={w * 0.42}
        fill={color}
      >
        {day}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Coffre de pirate (couvercle bombé, ferrures). Placé par le milieu de sa base.
 * `open` : 0 fermé → 1 ouvert ; `light` : lueur dorée intérieure.
 */
export const Chest: React.FC<{
  x: number;
  y: number;
  w?: number;
  open?: number;
  light?: number;
  opacity?: number;
  stroke?: string;
}> = ({
  x,
  y,
  w = 300,
  open = 0,
  light = 0,
  opacity = 1,
  stroke = palette.line,
}) => {
  const bodyH = w * 0.5;
  const lidH = w * 0.26;
  const sw = Math.max(2.5, w * 0.017);
  const lidLift = open * w * 0.2;
  const lidScale = 1 - open * 0.45;
  const lid = `M${-w / 2},0 L${-w / 2},${-lidH * 0.35} C${-w / 2},${-lidH * 1.25} ${w / 2},${-lidH * 1.25} ${w / 2},${-lidH * 0.35} L${w / 2},0 Z`;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {light > 0 ? (
        <g style={{ mixBlendMode: "screen" }} opacity={light}>
          <ellipse
            cx={0}
            cy={-bodyH}
            rx={w * 1.1}
            ry={w * 0.9}
            fill="url(#goldHalo)"
          />
          <polygon
            points={`${-w * 0.42},${-bodyH} ${w * 0.42},${-bodyH} ${w * 0.9},${-bodyH - w * 1.6} ${-w * 0.9},${-bodyH - w * 1.6}`}
            fill={`rgba(${palette.goldGlow}, 0.16)`}
            filter="url(#soft)"
          />
        </g>
      ) : null}
      {/* Corps */}
      <rect
        x={-w / 2}
        y={-bodyH}
        width={w}
        height={bodyH}
        rx={w * 0.03}
        {...base}
        stroke={stroke}
        strokeWidth={sw}
      />
      {[0.33, 0.66].map((k) => (
        <line
          key={k}
          x1={-w / 2}
          y1={-bodyH * k}
          x2={w / 2}
          y2={-bodyH * k}
          stroke={stroke}
          strokeWidth={sw * 0.5}
          opacity={0.4}
        />
      ))}
      {[-0.3, 0.3].map((k) => (
        <rect
          key={k}
          x={k * w - w * 0.035}
          y={-bodyH}
          width={w * 0.07}
          height={bodyH}
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.8}
        />
      ))}
      <rect
        x={-w * 0.07}
        y={-bodyH}
        width={w * 0.14}
        height={w * 0.16}
        rx={w * 0.015}
        {...base}
        stroke={stroke}
        strokeWidth={sw * 0.8}
      />
      <circle cx={0} cy={-bodyH + w * 0.06} r={w * 0.016} fill={stroke} />
      <line
        x1={0}
        y1={-bodyH + w * 0.07}
        x2={0}
        y2={-bodyH + w * 0.11}
        stroke={stroke}
        strokeWidth={sw * 0.7}
      />
      {/* Lueur dans l'entrebâillement */}
      {open > 0.02 ? (
        <rect
          x={-w / 2 + sw}
          y={-bodyH - lidLift}
          width={w - sw * 2}
          height={lidLift + sw}
          fill={light > 0 ? "url(#chestGap)" : "url(#chestGapCold)"}
        />
      ) : null}
      {/* Couvercle */}
      <g transform={`translate(0 ${-bodyH - lidLift}) scale(1 ${lidScale})`}>
        <path d={lid} {...base} stroke={stroke} strokeWidth={sw} />
        {[-0.3, 0.3].map((k) => (
          <path
            key={k}
            d={`M${k * w},0 L${k * w},${-lidH * 0.92}`}
            stroke={stroke}
            strokeWidth={sw * 0.8}
            fill="none"
          />
        ))}
        <line
          x1={-w / 2}
          y1={-lidH * 0.35}
          x2={w / 2}
          y2={-lidH * 0.35}
          stroke={stroke}
          strokeWidth={sw * 0.5}
          opacity={0.4}
        />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */

/** Manette de jeu vue de face. Placée par son centre ; largeur ≈ 700 * scale. */
export const Controller: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  lit?: number;
}> = ({ x, y, scale = 1, rotate = 0, lit = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path
      d="M-230,-110 C-150,-132 150,-132 230,-110 C292,-94 312,-40 322,20 C338,110 352,190 302,216 C256,240 214,202 190,160 C160,114 120,96 0,96 C-120,96 -160,114 -190,160 C-214,202 -256,240 -302,216 C-352,190 -338,110 -322,20 C-312,-40 -292,-94 -230,-110 Z"
      {...base}
      strokeWidth={7}
      filter="url(#glow)"
    />
    {/* Barre lumineuse */}
    <rect
      x={-70}
      y={-92}
      width={140}
      height={18}
      rx={9}
      fill={lit > 0 ? palette.gold : palette.ink}
      stroke={lit > 0 ? palette.goldLight : palette.line}
      strokeWidth={4}
      opacity={1}
      filter={lit > 0 ? "url(#glowStrong)" : undefined}
    />
    {/* Croix directionnelle */}
    <path
      d="M-232,-48 h28 v-28 h24 v28 h28 v24 h-28 v28 h-24 v-28 h-28 z"
      {...base}
      strokeWidth={4}
    />
    {/* Boutons */}
    {[
      [205, -62],
      [235, -32],
      [205, -2],
      [175, -32],
    ].map(([bx, by]) => (
      <circle
        key={`${bx}-${by}`}
        cx={bx}
        cy={by}
        r={14}
        {...base}
        strokeWidth={4}
      />
    ))}
    {/* Joysticks */}
    {[-105, 105].map((sx) => (
      <g key={sx}>
        <circle cx={sx} cy={36} r={46} {...base} strokeWidth={5} />
        <circle
          cx={sx}
          cy={36}
          r={24}
          fill="none"
          stroke={palette.lineSoft}
          strokeWidth={4}
        />
      </g>
    ))}
  </g>
);

/* ------------------------------------------------------------------ */

/** Téléphone portable. `ring` (0 → 1) déclenche ondes et halo. */
export const Phone: React.FC<{
  x: number;
  y: number;
  scale?: number;
  ring?: number;
  t?: number;
  rotate?: number;
}> = ({ x, y, scale = 1, ring = 0, t = 0, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    {ring > 0
      ? [0, 1, 2].map((i) => {
          const p = (t * 1.6 + i / 3) % 1;
          return (
            <g
              key={i}
              opacity={ring * (1 - p)}
              fill="none"
              stroke={palette.line}
              strokeWidth={5}
            >
              <path
                d={`M${-70 - p * 60},${-50} A${110 + p * 60},${110 + p * 60} 0 0 0 ${-70 - p * 60},${50}`}
              />
              <path
                d={`M${70 + p * 60},${-50} A${110 + p * 60},${110 + p * 60} 0 0 1 ${70 + p * 60},${50}`}
              />
            </g>
          );
        })
      : null}
    <rect
      x={-45}
      y={-85}
      width={90}
      height={170}
      rx={16}
      {...base}
      strokeWidth={5}
      filter="url(#glow)"
    />
    <rect
      x={-34}
      y={-70}
      width={68}
      height={130}
      rx={6}
      fill={ring > 0 ? "#dce6ff" : palette.inkLight}
      opacity={ring > 0 ? 0.25 + 0.55 * ring : 1}
    />
    <circle cx={0} cy={72} r={5} fill={palette.lineSoft} />
  </g>
);

/* ------------------------------------------------------------------ */

/** Canapé vu de face. Placé par le milieu de sa base. */
export const Sofa: React.FC<{ x: number; y: number; w?: number }> = ({
  x,
  y,
  w = 560,
}) => {
  const h = w * 0.42;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-w / 2 + w * 0.08}
        y={-h}
        width={w * 0.84}
        height={h * 0.55}
        rx={26}
        {...base}
      />
      <rect
        x={-w / 2 + w * 0.06}
        y={-h * 0.5}
        width={w * 0.88}
        height={h * 0.3}
        rx={18}
        {...base}
      />
      <rect
        x={-w / 2}
        y={-h * 0.72}
        width={w * 0.12}
        height={h * 0.62}
        rx={22}
        {...base}
      />
      <rect
        x={w / 2 - w * 0.12}
        y={-h * 0.72}
        width={w * 0.12}
        height={h * 0.62}
        rx={22}
        {...base}
      />
      <rect
        x={-w / 2 + w * 0.04}
        y={-h * 0.2}
        width={w * 0.92}
        height={h * 0.12}
        rx={8}
        {...base}
      />
      {[-0.42, 0.42].map((k) => (
        <line
          key={k}
          x1={k * w}
          y1={-h * 0.08}
          x2={k * w}
          y2={0}
          stroke={palette.line}
          strokeWidth={6}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

/** Bureau (plateau + pieds), vue de profil. Placé par le milieu de sa base. */
export const Desk: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
}> = ({ x, y, w = 240, h = 120 }) => (
  <g
    transform={`translate(${x} ${y})`}
    fill="none"
    stroke={palette.line}
    strokeWidth={6}
    strokeLinecap="round"
  >
    <line x1={-w / 2} y1={-h} x2={w / 2} y2={-h} strokeWidth={8} />
    <line x1={-w / 2 + 14} y1={-h} x2={-w / 2 + 14} y2={0} />
    <line x1={w / 2 - 14} y1={-h} x2={w / 2 - 14} y2={0} />
    <line
      x1={-w / 2 + 14}
      y1={-h * 0.45}
      x2={-w / 2 + 50}
      y2={-h * 0.45}
      opacity={0.6}
    />
  </g>
);

/** Écran posé (vue de profil ou de face). Placé par le milieu de son pied. */
export const Monitor: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  glow?: number;
  label?: string;
  crossed?: number;
}> = ({ x, y, w = 150, h = 100, glow = 0.4, label, crossed = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {glow > 0 ? (
      <ellipse
        cx={0}
        cy={-h / 2 - 30}
        rx={w * 1.2}
        ry={h * 1.2}
        fill="url(#poolFill)"
        opacity={glow}
      />
    ) : null}
    <line x1={0} y1={0} x2={0} y2={-26} stroke={palette.line} strokeWidth={6} />
    <line
      x1={-26}
      y1={0}
      x2={26}
      y2={0}
      stroke={palette.line}
      strokeWidth={6}
      strokeLinecap="round"
    />
    <rect
      x={-w / 2}
      y={-26 - h}
      width={w}
      height={h}
      rx={10}
      {...base}
      filter="url(#glow)"
    />
    <rect
      x={-w / 2 + 10}
      y={-16 - h}
      width={w - 20}
      height={h - 20}
      rx={4}
      fill="#c9d6ff"
      opacity={glow * 0.35}
    />
    {label ? (
      <text
        x={0}
        y={-26 - h / 2 + w * 0.06}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={w * 0.17}
        fill={palette.line}
      >
        {label}
      </text>
    ) : null}
    {crossed > 0 ? (
      <line
        x1={-w / 2 + 6}
        y1={-20}
        x2={-w / 2 + 6 + (w - 12) * crossed}
        y2={-20 - (h - 12) * crossed}
        stroke="#ff6b5a"
        strokeWidth={8}
        strokeLinecap="round"
        filter="url(#glow)"
      />
    ) : null}
  </g>
);

/** Chaise de profil (dossier à gauche). Placée par le milieu de sa base. */
export const Chair: React.FC<{ x: number; y: number; facing?: 1 | -1 }> = ({
  x,
  y,
  facing = 1,
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${facing} 1)`}
    fill="none"
    stroke={palette.line}
    strokeWidth={6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M-40,-150 L-40,-70 L40,-70" />
    <line x1={-40} y1={-70} x2={-40} y2={0} />
    <line x1={36} y1={-70} x2={36} y2={0} />
  </g>
);

/** Lit vu de profil. Placé par le milieu de sa base. */
export const Bed: React.FC<{
  x: number;
  y: number;
  w?: number;
  facing?: 1 | -1;
}> = ({ x, y, w = 460, facing = 1 }) => (
  <g
    transform={`translate(${x} ${y}) scale(${facing} 1)`}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x={-w / 2} y={-200} width={20} height={200} rx={8} {...base} />
    <rect x={w / 2 - 18} y={-130} width={18} height={130} rx={8} {...base} />
    <rect
      x={-w / 2 + 10}
      y={-110}
      width={w - 20}
      height={44}
      rx={14}
      {...base}
    />
    <line
      x1={-w / 2 + 10}
      y1={-50}
      x2={w / 2 - 10}
      y2={-50}
      stroke={palette.line}
      strokeWidth={6}
    />
  </g>
);

/** Couverture bombée posée sur le lit (dessinée par-dessus le dormeur). */
export const Blanket: React.FC<{
  x: number;
  y: number;
  w?: number;
  facing?: 1 | -1;
  breathe?: number;
}> = ({ x, y, w = 300, facing = 1, breathe = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>
    <path
      d={`M${-w / 2},0 C${-w / 2 + 30},${-70 - breathe * 6} ${w / 2 - 60},${-90 - breathe * 8} ${w / 2},0 Z`}
      {...base}
    />
    <path
      d={`M${-w / 2 + 40},-22 C${-w / 2 + 70},-48 ${-w / 2 + 110},-58 ${-w / 2 + 140},-60`}
      fill="none"
      stroke={palette.lineSoft}
      strokeWidth={3}
    />
  </g>
);

/** Hublot rond. `night` : 1 lune, 0 soleil levant. */
export const Porthole: React.FC<{
  x: number;
  y: number;
  r?: number;
  night?: number;
}> = ({ x, y, r = 90, night = 1 }) => {
  const id = `porthole-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <circle r={r * 0.82} />
        </clipPath>
      </defs>
      <circle r={r} {...base} strokeWidth={8} filter="url(#glow)" />
      <g clipPath={`url(#${id})`}>
        <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="#0a1636" />
        <rect
          x={-r}
          y={-r}
          width={r * 2}
          height={r * 2}
          fill="#f2a65a"
          opacity={(1 - night) * 0.55}
        />
        <circle
          cx={r * 0.22}
          cy={-r * 0.2 + (1 - night) * r * 0.9}
          r={r * 0.28}
          fill="#eef3ff"
          opacity={night}
        />
        <circle
          cx={r * 0.34}
          cy={-r * 0.28 + (1 - night) * r * 0.9}
          r={r * 0.24}
          fill="#0a1636"
          opacity={night}
        />
        <circle
          cx={-r * 0.1}
          cy={r * 0.75 - (1 - night) * r * 0.75}
          r={r * 0.3}
          fill="#ffd98c"
          opacity={1 - night}
        />
        <line
          x1={-r}
          y1={r * 0.35}
          x2={r}
          y2={r * 0.35}
          stroke={palette.lineFaint}
          strokeWidth={3}
        />
      </g>
      {[0, 90, 180, 270].map((a) => (
        <circle
          key={a}
          cx={Math.sin((a * Math.PI) / 180) * r * 0.91}
          cy={-Math.cos((a * Math.PI) / 180) * r * 0.91}
          r={4}
          fill={palette.line}
        />
      ))}
    </g>
  );
};

/** Sablier. `level` : proportion de sable restant en haut (1 → 0). */
export const Hourglass: React.FC<{
  x: number;
  y: number;
  h?: number;
  level?: number;
  t?: number;
  rotate?: number;
}> = ({ x, y, h = 420, level = 1, t = 0, rotate = 0 }) => {
  const w = h * 0.55;
  const half = h / 2 - 18;
  const neck = 10;
  const topSand = Math.max(0, level) * (half - 30);
  const bottomSand = (1 - Math.max(0, level)) * (half - 30);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect
        x={-w / 2 - 20}
        y={-h / 2 - 20}
        width={w + 40}
        height={22}
        rx={8}
        {...base}
      />
      <rect
        x={-w / 2 - 20}
        y={h / 2 - 2}
        width={w + 40}
        height={22}
        rx={8}
        {...base}
      />
      {[-1, 1].map((k) => (
        <line
          key={k}
          x1={k * (w / 2 + 6)}
          y1={-h / 2}
          x2={k * (w / 2 + 6)}
          y2={h / 2}
          stroke={palette.lineSoft}
          strokeWidth={6}
        />
      ))}
      {/* Sable */}
      <polygon
        points={`${-(neck + (topSand / half) * (w / 2 - neck))},${-topSand - 6} ${neck + (topSand / half) * (w / 2 - neck)},${-topSand - 6} ${neck},-6 ${-neck},-6`}
        fill={palette.gold}
        opacity={0.9}
      />
      <polygon
        points={`${-w / 2 + 16},${half} ${w / 2 - 16},${half} ${(w / 2 - 16) * 0.35},${half - bottomSand} ${-(w / 2 - 16) * 0.35},${half - bottomSand}`}
        fill={palette.gold}
        opacity={0.9}
      />
      {level > 0.01 ? (
        <line
          x1={0}
          y1={-4}
          x2={0}
          y2={half - bottomSand}
          stroke={palette.goldLight}
          strokeWidth={3}
          strokeDasharray="6 8"
          strokeDashoffset={-t * 120}
        />
      ) : null}
      <path
        d={`M${-w / 2},${-half} L${w / 2},${-half} C${w / 2},${-half * 0.4} ${neck},${-14} ${neck},0 C${neck},14 ${w / 2},${half * 0.4} ${w / 2},${half} L${-w / 2},${half} C${-w / 2},${half * 0.4} ${-neck},14 ${-neck},0 C${-neck},-14 ${-w / 2},${-half * 0.4} ${-w / 2},${-half} Z`}
        fill="rgba(200,215,255,0.06)"
        stroke={palette.line}
        strokeWidth={5}
        filter="url(#glow)"
      />
    </g>
  );
};

/** Horloge murale. Angles en degrés (0 = midi). */
export const Clock: React.FC<{
  x: number;
  y: number;
  r?: number;
  hour: number;
  minute: number;
}> = ({ x, y, r = 170, hour, minute }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} {...base} strokeWidth={8} filter="url(#glow)" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const long = i % 3 === 0;
      return (
        <line
          key={i}
          x1={Math.sin(a) * r * (long ? 0.74 : 0.8)}
          y1={-Math.cos(a) * r * (long ? 0.74 : 0.8)}
          x2={Math.sin(a) * r * 0.88}
          y2={-Math.cos(a) * r * 0.88}
          stroke={palette.line}
          strokeWidth={long ? 7 : 4}
          strokeLinecap="round"
        />
      );
    })}
    <line
      x1={0}
      y1={0}
      x2={Math.sin((hour * Math.PI) / 180) * r * 0.48}
      y2={-Math.cos((hour * Math.PI) / 180) * r * 0.48}
      stroke={palette.line}
      strokeWidth={12}
      strokeLinecap="round"
    />
    <line
      x1={0}
      y1={0}
      x2={Math.sin((minute * Math.PI) / 180) * r * 0.7}
      y2={-Math.cos((minute * Math.PI) / 180) * r * 0.7}
      stroke={palette.gold}
      strokeWidth={7}
      strokeLinecap="round"
      filter="url(#glow)"
    />
    <circle r={12} fill={palette.gold} />
  </g>
);

/** Bulle de pensée (ellipse + petites bulles vers `tailX, tailY`). */
export const ThoughtBubble: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  tailX: number;
  tailY: number;
  opacity?: number;
  children?: React.ReactNode;
}> = ({ x, y, w = 200, h = 140, tailX, tailY, opacity = 1, children }) => (
  <g opacity={opacity}>
    {[0.25, 0.55].map((k, i) => (
      <circle
        key={k}
        cx={tailX + (x - tailX) * k}
        cy={tailY + (y + h / 2 - tailY) * k}
        r={8 + i * 6}
        {...base}
        strokeWidth={4}
      />
    ))}
    <rect
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      rx={h / 2}
      {...base}
      filter="url(#glow)"
    />
    {children}
  </g>
);

/** Bulle de dialogue (rectangle arrondi, pointe vers `tailX, tailY`). */
export const SpeechBubble: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  tailX: number;
  tailY: number;
  opacity?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, tailX, tailY, opacity = 1, children }) => (
  <g opacity={opacity}>
    <path
      d={`M${x - 26},${y + h / 2 - 4} L${tailX},${tailY} L${x + 26},${y + h / 2 - 4} Z`}
      {...base}
      strokeWidth={4}
    />
    <rect
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      rx={28}
      {...base}
      filter="url(#glow)"
    />
    <rect
      x={x - 24}
      y={y + h / 2 - 8}
      width={48}
      height={12}
      fill={palette.ink}
    />
    {children}
  </g>
);

/** Carte de joueur (salon d'équipe). Placée par son centre. */
export const SquadCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  name: string;
  hero?: boolean;
  online?: number;
  gold?: number;
  dim?: number;
  asleep?: boolean;
  t?: number;
}> = ({
  x,
  y,
  w = 200,
  name,
  hero = false,
  online = 0,
  gold = 0,
  dim = 0,
  asleep = false,
  t = 0,
}) => {
  const h = w * 1.32;
  const accent = hero ? palette.hero : palette.mate;
  const border = gold > 0.5 ? palette.goldLight : palette.line;
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - dim * 0.6}>
      {gold > 0 ? (
        <rect
          x={-w / 2 - 30}
          y={-h / 2 - 30}
          width={w + 60}
          height={h + 60}
          rx={40}
          fill="url(#goldHalo)"
          opacity={gold}
        />
      ) : null}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={26}
        {...base}
        stroke={border}
        strokeWidth={5}
        filter="url(#glow)"
      />
      {/* Buste */}
      <circle cx={0} cy={-h * 0.14} r={w * 0.16} fill={accent} opacity={0.9} />
      <path
        d={`M${-w * 0.32},${h * 0.2} C${-w * 0.32},${h * 0.0} ${w * 0.32},${h * 0.0} ${w * 0.32},${h * 0.2} Z`}
        fill={accent}
        opacity={0.9}
      />
      {asleep ? (
        <text
          x={w * 0.2}
          y={-h * 0.26 - Math.sin(t * 3) * 6}
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={w * 0.14}
          fill={palette.lineSoft}
        >
          z
        </text>
      ) : null}
      <line
        x1={-w / 2 + 18}
        y1={h * 0.28}
        x2={w / 2 - 18}
        y2={h * 0.28}
        stroke={palette.lineFaint}
        strokeWidth={3}
      />
      <text
        x={-w / 2 + 22}
        y={h * 0.42}
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={w * 0.11}
        fill={palette.line}
      >
        {name}
      </text>
      <circle
        cx={w / 2 - 28}
        cy={h * 0.38}
        r={w * 0.045}
        fill={online > 0.5 ? palette.hero : "#5b6585"}
        filter={online > 0.5 ? "url(#glow)" : undefined}
      />
    </g>
  );
};

/** Livre ouvert posé à plat. */
export const OpenBook: React.FC<{
  x: number;
  y: number;
  w?: number;
  flip?: number;
}> = ({ x, y, w = 170, flip = 0 }) => (
  <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
    <path
      d={`M0,0 C${-w * 0.2},${-18} ${-w * 0.4},${-18} ${-w / 2},${-8} L${-w / 2},${-60} C${-w * 0.4},${-70} ${-w * 0.2},${-70} 0,${-52} Z`}
      {...base}
      strokeWidth={4}
    />
    <path
      d={`M0,0 C${w * 0.2},${-18} ${w * 0.4},${-18} ${w / 2},${-8} L${w / 2},${-60} C${w * 0.4},${-70} ${w * 0.2},${-70} 0,${-52} Z`}
      {...base}
      strokeWidth={4}
    />
    {flip > 0 && flip < 1 ? (
      <path
        d={`M0,-52 C${w * 0.2 * (1 - 2 * flip)},${-80} ${w * 0.4 * (1 - 2 * flip)},${-82} ${(w / 2) * (1 - 2 * flip)},${-70} L0,0 Z`}
        fill={palette.inkLight}
        stroke={palette.line}
        strokeWidth={3}
      />
    ) : null}
  </g>
);

/** Pile de livres. Placée par le milieu de sa base. */
export const BookStack: React.FC<{
  x: number;
  y: number;
  count?: number;
  w?: number;
}> = ({ x, y, count = 4, w = 130 }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: count }, (_, i) => (
      <rect
        key={i}
        x={-w / 2 + (i % 2 === 0 ? 0 : 8)}
        y={-(i + 1) * 26}
        width={w - 8}
        height={24}
        rx={5}
        {...base}
        strokeWidth={4}
      />
    ))}
  </g>
);

/** Assiette fumante. */
export const Plate: React.FC<{
  x: number;
  y: number;
  t: number;
  scale?: number;
}> = ({ x, y, t, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[-26, 0, 26].map((dx, i) => (
      <path
        key={dx}
        d={`M${dx},-30 C${dx - 14},-52 ${dx + 14},-66 ${dx},-90`}
        fill="none"
        stroke={palette.lineSoft}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.4 + 0.4 * Math.sin(t * 4 + i)}
        transform={`translate(0 ${-((t * 30 + i * 10) % 14)})`}
      />
    ))}
    <ellipse cx={0} cy={0} rx={90} ry={24} {...base} strokeWidth={5} />
    <ellipse
      cx={0}
      cy={-4}
      rx={52}
      ry={12}
      fill="none"
      stroke={palette.lineSoft}
      strokeWidth={3}
    />
    <ellipse
      cx={0}
      cy={-14}
      rx={40}
      ry={14}
      fill={palette.gold}
      opacity={0.85}
    />
  </g>
);

/** Pancarte sur piquet (plantée dans le sable). */
export const Signpost: React.FC<{
  x: number;
  y: number;
  h?: number;
  children?: React.ReactNode;
}> = ({ x, y, h = 220, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <line
      x1={0}
      y1={0}
      x2={0}
      y2={-h}
      stroke={palette.line}
      strokeWidth={10}
      strokeLinecap="round"
    />
    <g transform={`translate(0 ${-h})`}>{children}</g>
  </g>
);
