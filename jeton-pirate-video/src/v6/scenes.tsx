/**
 * Scènes de la vidéo 6 (« la chance ») : les deux cartes, le jeton qui
 * disparaît, « la chance » tamponnée FAUX, l'escalade face au pote, trois soirs
 * de chasse, le coffre d'une heure douze et la réponse du lendemain.
 */
import { bodyFont, impactFont } from "../fonts";
import { inOut, mix, pop, progress, shake, wave } from "../lib/anim";
import { Stage, useSceneTime } from "../lib/scene";
import { palette } from "../theme";
import {
  Figure,
  LEG,
  STAND,
  Token,
  blendPose,
} from "../components/art/Characters";
import {
  Beam,
  Burst,
  Dust,
  Moon,
  Pool,
  Stars,
} from "../components/art/Environment";
import {
  CalendarCard,
  Chest,
  SpeechBubble,
  SquadCard,
} from "../components/art/Props";
import { Floor } from "../scenes/common";
import { Stamp } from "../v4/props";

const base = {
  stroke: palette.line,
  strokeWidth: 5,
  fill: palette.ink,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const RED = "#ff4f5e";
const GREEN = "#4fd17f";

/* Accessoires --------------------------------------------------------- */

/** Champignon déçu (le butin du héros). */
const Mushroom: React.FC<{
  x: number;
  y: number;
  s?: number;
  opacity?: number;
}> = ({ x, y, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path
      d="M-30,0 L-24,-62 L24,-62 L30,0 Z"
      fill="#f4efe0"
      stroke={palette.line}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path
      d="M-100,-56 C-100,-150 100,-150 100,-56 C62,-40 -62,-40 -100,-56 Z"
      fill="#d8452f"
      stroke={palette.line}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <circle cx={-48} cy={-92} r={15} fill="#f4efe0" />
    <circle cx={18} cy={-112} r={12} fill="#f4efe0" />
    <circle cx={58} cy={-76} r={10} fill="#f4efe0" />
    <circle cx={-10} cy={-32} r={4} fill={palette.ink} />
    <circle cx={10} cy={-32} r={4} fill={palette.ink} />
    <path
      d="M-10,-14 Q0,-22 10,-14"
      fill="none"
      stroke={palette.ink}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </g>
);

/** Trèfle à quatre feuilles. */
const Clover: React.FC<{ x: number; y: number; s?: number }> = ({
  x,
  y,
  s = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M0,6 Q12,44 -6,72"
      fill="none"
      stroke={GREEN}
      strokeWidth={8}
      strokeLinecap="round"
    />
    {[45, 135, 225, 315].map((a) => (
      <ellipse
        key={a}
        cx={0}
        cy={-26}
        rx={20}
        ry={28}
        transform={`rotate(${a})`}
        fill={GREEN}
        stroke={palette.line}
        strokeWidth={3}
      />
    ))}
  </g>
);

/** Afficheur lumineux (heure, compteur). */
const Panel: React.FC<{
  x: number;
  y: number;
  text: string;
  color: string;
  w?: number;
  h?: number;
  size?: number;
  glow?: number;
  scale?: number;
  opacity?: number;
  sub?: string;
}> = ({
  x,
  y,
  text,
  color,
  w = 380,
  h = 190,
  size = 120,
  glow = 1,
  scale = 1,
  opacity = 1,
  sub,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {glow > 0 ? (
      <rect
        x={-w / 2 - 40}
        y={-h / 2 - 40}
        width={w + 80}
        height={h + 80}
        rx={60}
        fill={color}
        opacity={0.12 * glow}
        filter="url(#soft)"
      />
    ) : null}
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      rx={28}
      fill={palette.ink}
      stroke={color}
      strokeWidth={6}
      filter={glow > 0.5 ? "url(#glow)" : undefined}
    />
    <text
      y={size * 0.36}
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={size}
      letterSpacing={2}
      fill={color}
    >
      {text}
    </text>
    {sub ? (
      <text
        y={h / 2 + 58}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={38}
        fill={palette.lineSoft}
      >
        {sub}
      </text>
    ) : null}
  </g>
);

/** Étiquette arrondie (« SOIR 1 », « LUI », « TOI »). */
const Pill: React.FC<{
  x: number;
  y: number;
  text: string;
  color: string;
  size?: number;
  opacity?: number;
  scale?: number;
}> = ({ x, y, text, color, size = 46, opacity = 1, scale = 1 }) => {
  const w = text.length * size * 0.72 + size * 1.2;
  const h = size * 1.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={palette.ink}
        stroke={color}
        strokeWidth={4}
      />
      <text
        y={size * 0.36}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={size}
        letterSpacing={3}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
};

/** Cadre « LUI | TOI » des trois manches. */
const Versus: React.FC<{ toi: number }> = ({ toi }) => (
  <g>
    <line
      x1={540}
      y1={800}
      x2={540}
      y2={1660}
      stroke={palette.lineFaint}
      strokeWidth={4}
      strokeDasharray="16 16"
    />
    <Pill x={270} y={850} text="LUI" color={palette.goldLight} />
    <Pill
      x={810}
      y={850}
      text="TOI"
      color={palette.hero}
      opacity={0.45 + 0.55 * toi}
      scale={1 + 0.12 * toi}
    />
  </g>
);

/** Le pote (à gauche) et toi (à droite), en bas des manches. */
const Rivals: React.FC<{ t: number; toi: number; ground: number }> = ({
  t,
  toi,
  ground,
}) => (
  <g>
    <Figure
      x={270}
      y={ground - LEG * 0.85}
      scale={0.85}
      facing={1}
      pose={{ ...STAND, armL: [-30, -70], armR: [30, 70], nod: -6 }}
    />
    <Figure
      x={810}
      y={ground - LEG * 0.85}
      scale={0.85}
      hero
      facing={-1}
      pose={blendPose(
        { ...STAND, nod: 6 },
        { ...STAND, armR: [150 + wave(t, 0.7) * 6, 170], nod: -8 },
        toi,
      )}
    />
  </g>
);

/* 1. « Ton meilleur pote a eu LE JETON PIRATE hier soir. Toi, t'as eu quoi ? DES CHAMPIGNONS. » */
export const V6Cards: React.FC = () => {
  const { t, at } = useSceneTime();
  const you = progress(t, at("toi"), 0.4);
  const shroom = pop(t, at("champi"), 200);
  const cardY = 1200;
  const w = 330;
  const top = cardY - (w * 1.32) / 2;
  return (
    <Stage>
      <Stars t={t} count={50} area={[0, 760, 1080, 600]} opacity={0.5} />
      <Beam x={300} bottom={1100} opacity={0.8} />
      <Beam x={780} bottom={1100} opacity={0.25 + 0.35 * you} />
      <Pool x={300} y={1520} rx={230} ry={40} gold opacity={0.7} />
      <SquadCard
        x={300}
        y={cardY}
        w={w}
        name="TON POTE"
        online={1}
        gold={1}
        t={t}
      />
      <Token
        x={300}
        y={top - 130 + wave(t, 2.2) * 8}
        r={92}
        spin={t * 16}
        rays={0.7}
      />
      <SquadCard
        x={780}
        y={cardY}
        w={w}
        name="TOI"
        hero
        online={you}
        dim={0.55 * (1 - you)}
        t={t}
      />
      {/* Avant la réponse : un point d'interrogation, puis le champignon */}
      <text
        x={780}
        y={top - 70}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={170}
        fill={palette.lineSoft}
        opacity={1 - Math.min(1, shroom * 1.5)}
      >
        ?
      </text>
      <Mushroom
        x={780}
        y={top - 20 + (1 - shroom) * 40}
        s={1.15 * shroom}
        opacity={Math.min(1, shroom * 1.4)}
      />
    </Stage>
  );
};

/* 2. « Et le 5 décembre, IL DISPARAÎT. Pour toujours. » ----------------- */
export const V6Gone: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const gone = atPart("dec5", 1);
  const fade = 1 - progress(t, gone, 0.45);
  const ever = progress(t, at("toujours"), 0.8);
  return (
    <Stage>
      <Stars t={t} count={60} area={[0, 760, 1080, 700]} opacity={0.6} />
      <Beam x={540} bottom={1150} opacity={0.75 - 0.3 * ever} />
      <Floor y={1560} t={t} />
      <CalendarCard
        x={540}
        y={1290}
        day={5}
        w={300}
        highlight={ever < 0.5}
        opacity={1 - ever * 0.45}
      />
      {/* La place vide du jeton */}
      <circle
        cx={540}
        cy={950}
        r={118}
        fill="none"
        stroke={palette.lineFaint}
        strokeWidth={5}
        strokeDasharray="14 16"
        opacity={progress(t, gone + 0.3, 0.6) * (1 - ever * 0.5)}
      />
      <Token
        x={540}
        y={950 + wave(t, 2.2) * 8}
        r={118}
        spin={t * 14}
        rays={0.7 * fade}
        glow={fade}
        opacity={fade}
      />
      <Burst
        x={540}
        y={950}
        elapsed={t - gone}
        count={120}
        spread={340}
        rise={260}
        duration={1.2}
        seed="v6gone"
      />
      <Dust
        t={t}
        area={[300, 800, 480, 500]}
        color={palette.goldLight}
        opacity={0.5 * (1 - ever)}
        count={30}
      />
    </Stage>
  );
};

/* 3. « Tu lui demandes comment il a fait. Il répond : « La chance. » FAUX. » */
export const V6Luck: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1580;
  const ask = pop(t, 0.35);
  const luck = pop(t, atPart("repond", 1), 200);
  const slam = at("faux");
  const stamp = progress(t, slam, 0.18);
  const jolt = t > slam && t < slam + 0.3 ? shake(t, 9, 6) : 0;
  const heroHead = ground - LEG - 210;
  return (
    <Stage>
      <Beam x={300} bottom={1000} opacity={0.55} />
      <Beam x={780} bottom={1000} opacity={0.75} />
      <Floor y={ground} t={t} />
      <Pool x={780} y={ground} rx={200} ry={36} gold opacity={0.6} />
      {/* Toi */}
      <Figure
        x={300}
        y={ground - LEG}
        hero
        facing={1}
        pose={{ ...STAND, armR: [70, 110], nod: -4 }}
      />
      <SpeechBubble
        x={300}
        y={heroHead - 120}
        w={170}
        h={130}
        tailX={320}
        tailY={heroHead - 20}
        opacity={ask * (1 - progress(t, atPart("repond", 1), 0.3))}
      >
        <text
          x={300}
          y={heroHead - 88}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={92}
          fill={palette.hero}
        >
          ?
        </text>
      </SpeechBubble>
      {/* Le pote, son jeton au-dessus de la tête */}
      <Figure
        x={780}
        y={ground - LEG}
        facing={-1}
        pose={{ ...STAND, armL: [-40, -100], armR: [40, 100], nod: -10 }}
      />
      <Token
        x={780}
        y={heroHead - 70 + wave(t, 2) * 6}
        r={54}
        spin={t * 20}
        rays={0.4}
      />
      <g transform={`translate(${jolt} 0)`}>
        <SpeechBubble
          x={600}
          y={1040}
          w={600}
          h={200}
          tailX={720}
          tailY={1170}
          opacity={Math.min(1, luck * 1.4)}
        >
          <Clover x={365} y={1030} s={0.9 * luck} />
          <text
            x={415}
            y={1064}
            textAnchor="start"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={70}
            fill={palette.line}
          >
            LA CHANCE
          </text>
        </SpeechBubble>
        <Stamp x={600} y={1040} p={stamp} text="FAUX" color={RED} />
      </g>
    </Stage>
  );
};

/* 4. « Il a joué jusqu'à 2 h ? Toi, 2 H ET UNE MINUTE. » ----------------- */
export const V6Clocks: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const toi = progress(t, at("toi1"), 0.3);
  const flip = atPart("toi1", 1);
  const plus = pop(t, flip, 220);
  return (
    <Stage>
      <Beam x={270} bottom={1000} opacity={0.5} />
      <Beam x={810} bottom={1000} opacity={0.3 + 0.45 * toi} />
      <Versus toi={toi} />
      <Panel
        x={270}
        y={1130}
        w={400}
        text="02:00"
        color={palette.goldLight}
        opacity={pop(t, 0.1)}
      />
      <Panel
        x={810}
        y={1130}
        w={400}
        text={t < flip ? "02:00" : "02:01"}
        color={palette.hero}
        glow={toi}
        opacity={0.35 + 0.65 * toi}
        scale={1 + 0.08 * plus * (t > flip ? 1 : 0)}
      />
      <Burst
        x={810}
        y={1130}
        elapsed={t - flip}
        count={50}
        spread={260}
        rise={120}
        duration={0.8}
        seed="v6clock"
        color={palette.hero}
      />
      <Rivals t={t} toi={toi} ground={1640} />
    </Stage>
  );
};

/* 5. « Il a ouvert 300 coffres ? Toi, 301. » ----------------------------- */
export const V6Chests: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const toi = progress(t, at("toi2"), 0.3);
  const count = Math.round(300 * progress(t, 0.2, 1.1, (v) => v));
  const mine = atPart("toi2", 1);
  const plus = pop(t, mine, 220);
  return (
    <Stage>
      <Beam x={270} bottom={1000} opacity={0.5} />
      <Beam x={810} bottom={1000} opacity={0.3 + 0.45 * toi} />
      <Versus toi={toi} />
      <Panel
        x={270}
        y={1060}
        w={330}
        h={170}
        size={110}
        text={String(count)}
        color={palette.goldLight}
        sub="coffres"
      />
      <Panel
        x={810}
        y={1060}
        w={330}
        h={170}
        size={110}
        text={t < mine ? "300" : "301"}
        color={palette.hero}
        glow={toi}
        opacity={0.35 + 0.65 * toi}
        scale={1 + 0.1 * plus * (t > mine ? 1 : 0)}
        sub="coffres"
      />
      <Pool x={270} y={1560} rx={170} ry={30} gold opacity={0.4} />
      <Chest x={270} y={1560} w={230} open={0.25} />
      <Pool x={810} y={1560} rx={170} ry={30} opacity={0.6} />
      <Chest
        x={810}
        y={1560}
        w={230}
        open={progress(t, mine - 0.1, 0.3)}
        light={plus}
      />
      <Burst
        x={810}
        y={1460}
        elapsed={t - mine}
        count={50}
        spread={220}
        rise={160}
        duration={0.9}
        seed="v6chest"
        color={palette.hero}
      />
    </Stage>
  );
};

/* 6. « Il a fouillé le nord de l'île ? Toi, le sud… PUIS LE NORD. » ------- */
const ISLAND =
  "M300,1000 C380,880 620,860 760,930 C880,990 905,1120 850,1240 " +
  "C800,1360 860,1450 740,1510 C600,1570 420,1550 330,1460 " +
  "C230,1360 220,1110 300,1000 Z";
const SOUTH_PATH =
  "M300,1380 C380,1500 560,1520 690,1470 C790,1430 780,1330 690,1300";
const NORTH_PATH =
  "M690,1300 C560,1250 470,1170 470,1080 C470,990 600,960 700,1000";

export const V6Map: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const his = pop(t, 0.4);
  const you = pop(t, at("toi3"), 200);
  const south = progress(t, atPart("toi3", 1), 0.8);
  const north = progress(t, atPart("toi3", 2), 0.8);
  const heroPt =
    north > 0 ? [700, 1000] : south > 0 ? [690, 1300] : [300, 1380];
  return (
    <Stage>
      {/* Quadrillage de carte */}
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={80}
          y1={840 + i * 125}
          x2={1000}
          y2={840 + i * 125}
          stroke={palette.lineFaint}
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={100 + i * 125}
          y1={800}
          x2={100 + i * 125}
          y2={1640}
          stroke={palette.lineFaint}
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      <path
        d={ISLAND}
        {...base}
        fill={palette.inkLight}
        strokeWidth={6}
        filter="url(#glow)"
      />
      {/* Boussole */}
      <text
        x={950}
        y={880}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={56}
        fill={palette.line}
      >
        N
      </text>
      <path d="M950,900 L935,960 L950,950 L965,960 Z" fill={palette.line} />
      {/* Sa zone : le nord */}
      <ellipse
        cx={580}
        cy={1020}
        rx={210 * his}
        ry={95 * his}
        fill={palette.gold}
        fillOpacity={0.14}
        stroke={palette.goldLight}
        strokeWidth={5}
        strokeDasharray="16 12"
        opacity={Math.min(1, his)}
      />
      <Pill
        x={580}
        y={1020}
        text="LUI"
        color={palette.goldLight}
        size={38}
        scale={his}
        opacity={Math.min(1, his) * (1 - north * 0.6)}
      />
      {/* Ton trajet : le sud, puis le nord */}
      <path
        d={SOUTH_PATH}
        pathLength={1}
        fill="none"
        stroke={palette.hero}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - south}
        filter="url(#glow)"
      />
      <path
        d={NORTH_PATH}
        pathLength={1}
        fill="none"
        stroke={palette.hero}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - north}
        filter="url(#glow)"
      />
      <ellipse
        cx={560}
        cy={1430}
        rx={230}
        ry={85}
        fill={palette.hero}
        fillOpacity={0.12 * south}
        stroke={palette.hero}
        strokeWidth={4}
        opacity={south}
      />
      <ellipse
        cx={580}
        cy={1020}
        rx={250}
        ry={115}
        fill={palette.hero}
        fillOpacity={0.12 * north}
        stroke={palette.hero}
        strokeWidth={4}
        opacity={north}
      />
      <g
        transform={`translate(${heroPt[0]} ${heroPt[1]})`}
        opacity={Math.min(1, you)}
      >
        <circle r={26 * you} fill={palette.hero} filter="url(#glow)" />
        <circle r={10} fill={palette.ink} />
      </g>
      <Pill
        x={300}
        y={1600}
        text="TOI"
        color={palette.hero}
        size={38}
        scale={you}
        opacity={Math.min(1, you)}
      />
    </Stage>
  );
};

/* 7. « Premier soir : RIEN. Deuxième soir : RIEN. » ---------------------- */
export const V6Nights: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1560;
  const steps = [
    { at: at("soir1"), part: atPart("soir1", 1), label: "SOIR 1" },
    { at: at("soir2"), part: atPart("soir2", 1), label: "SOIR 2" },
  ];
  const idx = t >= steps[1].at ? 1 : 0;
  const step = steps[idx];
  const open = Math.max(
    ...steps.map((s, i) =>
      inOut(t, s.part - 0.15, (steps[i + 1]?.at ?? 99) - 0.05, 0.15, 0.2),
    ),
  );
  const slump = Math.max(...steps.map((s) => progress(t, s.part, 0.4)));
  return (
    <Stage>
      <Stars t={t} count={70} area={[0, 760, 1080, 600]} opacity={0.7} />
      <Moon x={860} y={900} r={40} />
      <Beam x={560} bottom={1000} opacity={0.6} />
      <Floor y={ground} t={t} />
      <Pill
        x={540}
        y={900}
        text={step.label}
        color={palette.line}
        size={54}
        scale={pop(t, step.at)}
      />
      <Pool x={620} y={ground} rx={280} ry={44} />
      <Chest x={620} y={ground} w={320} open={open} />
      {steps.map((s, i) => (
        <Burst
          key={i}
          x={620}
          y={ground - 200}
          elapsed={t - s.part}
          count={30}
          spread={150}
          rise={100}
          duration={0.8}
          seed={`v6night${i}`}
          color="#9aa8cc"
        />
      ))}
      <Figure
        x={250}
        y={ground - LEG}
        hero
        facing={1}
        pose={blendPose(
          { ...STAND, armR: [60, 100], nod: -4 },
          { ...STAND, armL: [-8, -2], armR: [8, 2], lean: 10, nod: 24 },
          slump * (t < steps[1].at || t > steps[1].part ? 1 : 0.4),
        )}
      />
    </Stage>
  );
};

/* 8. « Il t'envoie une capture de son jeton. Tu fermes l'appli… ET TU RELANCES. » */
export const V6Phone: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const notif = pop(t, 0.25, 200);
  const buzz = t > 0.25 && t < 0.9 ? shake(t, 7, 3) : 0;
  const close = progress(t, at("ferme") + 0.35, 0.5);
  const relaunch = atPart("ferme", 1);
  const on = pop(t, relaunch, 220);
  const lit = progress(t, relaunch, 0.25);
  const phoneY = 1220;
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.5 + 0.35 * lit} />
      <circle
        cx={540}
        cy={phoneY}
        r={520}
        fill={palette.hero}
        opacity={0.1 * lit}
        filter="url(#soft)"
      />
      <g
        transform={`translate(${540 + buzz} ${phoneY}) rotate(${mix(-4, 0, lit)}) scale(${1 - close * 0.06 + lit * 0.06})`}
      >
        <rect
          x={-210}
          y={-390}
          width={420}
          height={780}
          rx={56}
          {...base}
          strokeWidth={8}
          filter="url(#glow)"
        />
        <rect
          x={-180}
          y={-345}
          width={360}
          height={680}
          rx={22}
          fill="#050a1c"
        />
        {/* La capture du pote */}
        <g opacity={(1 - close) * Math.min(1, notif * 1.3)}>
          <g transform={`translate(0 ${(1 - notif) * -60})`}>
            <rect
              x={-160}
              y={-320}
              width={320}
              height={110}
              rx={20}
              fill={palette.inkLight}
              stroke={palette.lineFaint}
              strokeWidth={3}
            />
            <circle cx={-110} cy={-265} r={30} fill={palette.mate} />
            <text
              x={-66}
              y={-274}
              fontFamily={impactFont}
              fontWeight={900}
              fontSize={30}
              fill={palette.goldLight}
            >
              TON POTE
            </text>
            <text
              x={-66}
              y={-234}
              fontFamily={bodyFont}
              fontWeight={600}
              fontSize={28}
              fill={palette.lineSoft}
            >
              t&apos;a envoyé une photo
            </text>
          </g>
          <rect
            x={-150}
            y={-170}
            width={300}
            height={400}
            rx={18}
            fill={palette.deep}
            stroke={palette.goldLight}
            strokeWidth={4}
          />
          <circle cx={0} cy={20} r={150} fill="url(#goldHalo)" opacity={0.7} />
          <Token x={0} y={10} r={84} spin={t * 18} rays={0.5} />
          <text
            y={190}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={44}
            fill={palette.goldLight}
          >
            EZ.
          </text>
        </g>
        {/* Relancer */}
        {on > 0 ? (
          <g opacity={Math.min(1, on * 1.4)}>
            <rect
              x={-180}
              y={-345}
              width={360}
              height={680}
              rx={22}
              fill={palette.hero}
              opacity={0.16}
            />
            <g transform={`scale(${on})`}>
              <rect
                x={-170}
                y={-60}
                width={340}
                height={120}
                rx={60}
                fill={palette.hero}
                filter="url(#glow)"
              />
              <path d="M-134,-24 L-134,24 L-96,0 Z" fill={palette.ink} />
              <text
                x={-78}
                y={14}
                textAnchor="start"
                fontFamily={impactFont}
                fontWeight={900}
                fontSize={38}
                fill={palette.ink}
              >
                RELANCER
              </text>
            </g>
          </g>
        ) : null}
        <circle cx={0} cy={360} r={8} fill={palette.lineSoft} />
      </g>
      <Burst
        x={540}
        y={phoneY}
        elapsed={t - relaunch}
        count={80}
        spread={420}
        rise={200}
        duration={1}
        seed="v6relaunch"
        color={palette.hero}
      />
    </Stage>
  );
};

/* 9. « Troisième soir. 1 H 12. Dernier coffre de la nuit… ET IL EST LÀ. » */
export const V6Third: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1560;
  const reveal = atPart("dernier", 1);
  const time = pop(t, at("h112"), 220);
  const crack = progress(t, at("dernier") + 0.3, 0.6);
  const rise = progress(t, reveal, 0.6);
  const pulse = 0.35 + 0.2 * wave(t, 1.1);
  return (
    <Stage>
      <Stars
        t={t}
        count={80}
        area={[0, 760, 1080, 600]}
        opacity={0.8 - rise * 0.4}
      />
      <Moon x={860} y={880} r={46} />
      <Beam x={540} bottom={1000} opacity={0.5} />
      <Floor y={ground} t={t} />
      <Pill
        x={300}
        y={880}
        text="SOIR 3"
        color={palette.line}
        size={46}
        scale={pop(t, 0.1)}
        opacity={1 - rise * 0.5}
      />
      <Panel
        x={540}
        y={1080}
        w={400}
        h={180}
        size={120}
        text="01:12"
        color={palette.goldLight}
        scale={time * (1 - rise * 0.25)}
        opacity={Math.min(1, time) * (1 - rise * 0.6)}
      />
      <circle
        cx={540}
        cy={1340}
        r={600}
        fill="url(#goldHalo)"
        opacity={rise * 0.7}
      />
      <Pool
        x={540}
        y={ground}
        rx={320}
        ry={50}
        gold
        opacity={pulse + crack * 0.5}
      />
      <Chest
        x={540}
        y={ground}
        w={440}
        open={Math.max(crack * 0.35, rise)}
        light={pulse + crack + rise}
      />
      <Burst
        x={540}
        y={1340}
        elapsed={t - reveal}
        count={120}
        spread={380}
        rise={360}
        duration={1.4}
        seed="v6reveal"
      />
      {rise > 0 ? (
        <Token
          x={540}
          y={mix(1370, 1080, rise)}
          r={140}
          spin={t * 18}
          rays={0.9}
          glow={1}
        />
      ) : null}
    </Stage>
  );
};

/* 10. « Le lendemain, ton pote te demande comment t'as fait. Tu réponds : « LA CHANCE. » » */
export const V6Answer: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1620;
  const ask = pop(t, atPart("lendemain", 1));
  const answer = atPart("reponds", 1);
  const luck = pop(t, answer, 200);
  const head = ground - LEG - 210;
  const stats = [
    { value: "+1", label: "minute" },
    { value: "+1", label: "coffre" },
    { value: "+1", label: "zone" },
  ];
  return (
    <Stage>
      <rect
        x={0}
        y={0}
        width={1080}
        height={1920}
        fill="#ffd9a0"
        opacity={0.06}
      />
      <Beam x={780} bottom={1100} opacity={0.75} />
      <Beam x={300} bottom={1100} opacity={0.45} />
      <Floor y={ground} t={t} />
      {/* Ce qu'il y a derrière « la chance » */}
      <g opacity={progress(t, 0.2, 0.5)}>
        <rect
          x={150}
          y={790}
          width={780}
          height={230}
          rx={30}
          fill={palette.ink}
          stroke={luck > 0.5 ? palette.goldLight : palette.lineFaint}
          strokeWidth={4}
          filter={luck > 0.5 ? "url(#glow)" : undefined}
        />
        {stats.map((s, i) => {
          const p = pop(t, 0.3 + i * 0.25);
          const x = 280 + i * 260;
          return (
            <g key={s.label} transform={`translate(${x} 905) scale(${p})`}>
              <text
                textAnchor="middle"
                fontFamily={impactFont}
                fontWeight={900}
                fontSize={76}
                fill={palette.hero}
              >
                {s.value}
              </text>
              <text
                y={58}
                textAnchor="middle"
                fontFamily={bodyFont}
                fontWeight={600}
                fontSize={32}
                fill={palette.lineSoft}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </g>
      {/* Le pote demande */}
      <Figure
        x={290}
        y={ground - LEG}
        facing={1}
        pose={{ ...STAND, armR: [60, 100], nod: -4 }}
      />
      <SpeechBubble
        x={290}
        y={head - 110}
        w={170}
        h={130}
        tailX={300}
        tailY={head - 15}
        opacity={ask * (1 - progress(t, answer - 0.3, 0.3))}
      >
        <text
          x={290}
          y={head - 78}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={92}
          fill={palette.goldLight}
        >
          ?
        </text>
      </SpeechBubble>
      {/* Toi, le jeton à la main */}
      <Pool
        x={790}
        y={ground}
        rx={220}
        ry={40}
        gold
        opacity={0.6 + luck * 0.3}
      />
      <Figure
        x={790}
        y={ground - LEG}
        hero
        facing={-1}
        pose={{ ...STAND, armR: [150, 170], armL: [-20, -10], nod: -8 }}
      />
      <Token
        x={880}
        y={head - 70 + wave(t, 2) * 6}
        r={62}
        spin={t * 20}
        rays={0.5 + luck * 0.3}
      />
      <SpeechBubble
        x={540}
        y={1140}
        w={560}
        h={170}
        tailX={720}
        tailY={1270}
        opacity={Math.min(1, luck * 1.4)}
      >
        <Clover x={318} y={1130} s={0.75 * luck} />
        <text
          x={362}
          y={1162}
          textAnchor="start"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={64}
          fill={palette.line}
        >
          LA CHANCE
        </text>
      </SpeechBubble>
      <Burst
        x={880}
        y={head - 70}
        elapsed={t - answer}
        count={70}
        spread={260}
        rise={220}
        duration={1.1}
        seed="v6answer"
      />
      <Dust
        t={t}
        area={[600, 900, 420, 600]}
        color={palette.goldLight}
        opacity={0.4 + luck * 0.3}
        count={30}
      />
    </Stage>
  );
};
