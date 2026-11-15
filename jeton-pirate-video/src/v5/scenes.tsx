/**
 * Scènes de la vidéo 5 (« le blocus ») : le jeton disparaît, le lycée bloqué,
 * la journée de chasse à la maison, 23 h 59, le jeton.
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
  walkPose,
} from "../components/art/Characters";
import type { Pose } from "../components/art/Characters";
import {
  Beam,
  Burst,
  Dust,
  Moon,
  Pool,
  Sea,
} from "../components/art/Environment";
import {
  CalendarCard,
  Chest,
  Clock,
  Controller,
  Monitor,
  SpeechBubble,
  SquadCard,
} from "../components/art/Props";
import { SQUAD, SQUAD_X } from "../scenes/Act1";
import { Beach, Floor } from "../scenes/common";
import { VoiceWave } from "../v2/props";

const base = {
  stroke: palette.line,
  strokeWidth: 5,
  fill: palette.ink,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/** Banderole tendue « LE JETON ». */
const Banner: React.FC<{
  x: number;
  y: number;
  w?: number;
  p: number;
  text?: string;
  t: number;
}> = ({ x, y, w = 620, p, text = "LE JETON", t }) => (
  <g
    transform={`translate(${x} ${y}) scale(${p} 1)`}
    opacity={Math.min(1, p * 1.5)}
  >
    <path
      d={`M${-w / 2},-50 Q0,${-40 + wave(t, 1.6) * 8} ${w / 2},-50 L${w / 2},50 Q0,${60 + wave(t, 1.6) * 8} ${-w / 2},50 Z`}
      fill="#f4efe0"
      stroke={palette.line}
      strokeWidth={4}
    />
    <text
      y={22}
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={64}
      fill="#c8321e"
      letterSpacing={4}
    >
      {text}
    </text>
  </g>
);

/** Portail du lycée (barreaux). */
const Gate: React.FC<{ x: number; y: number; lock: number }> = ({
  x,
  y,
  lock,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-380} y={-520} width={60} height={520} {...base} />
    <rect x={320} y={-520} width={60} height={520} {...base} />
    <text
      x={0}
      y={-560}
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={54}
      letterSpacing={10}
      fill={palette.line}
    >
      LYCÉE
    </text>
    {Array.from({ length: 11 }, (_, i) => (
      <line
        key={i}
        x1={-300 + i * 60}
        y1={-430}
        x2={-300 + i * 60}
        y2={0}
        stroke={palette.line}
        strokeWidth={8}
      />
    ))}
    <line
      x1={-320}
      y1={-430}
      x2={320}
      y2={-430}
      stroke={palette.line}
      strokeWidth={10}
    />
    <line
      x1={-320}
      y1={-60}
      x2={320}
      y2={-60}
      stroke={palette.line}
      strokeWidth={10}
    />
    {/* Cadenas */}
    <g transform={`translate(0 -230) scale(${lock})`} opacity={lock}>
      <path
        d="M-30,-20 C-30,-70 30,-70 30,-20"
        fill="none"
        stroke={palette.goldLight}
        strokeWidth={10}
      />
      <rect
        x={-46}
        y={-24}
        width={92}
        height={74}
        rx={12}
        fill={palette.gold}
        stroke={palette.goldLight}
        strokeWidth={4}
        filter="url(#glow)"
      />
      <circle cy={8} r={8} fill={palette.ink} />
    </g>
  </g>
);

/** Petite maison. */
const House: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      x={-170}
      y={-260}
      width={340}
      height={260}
      {...base}
      filter="url(#glow)"
    />
    <path d="M-200,-250 L0,-420 L200,-250 Z" {...base} />
    <rect
      x={-40}
      y={-130}
      width={80}
      height={130}
      rx={6}
      fill={palette.inkLight}
      stroke={palette.line}
      strokeWidth={4}
    />
    <rect
      x={70}
      y={-200}
      width={70}
      height={60}
      fill={palette.goldLight}
      opacity={0.75}
    />
    <rect
      x={-140}
      y={-200}
      width={70}
      height={60}
      fill={palette.goldLight}
      opacity={0.75}
    />
  </g>
);

/* 1. « Le 5 décembre, le jeton pirate DISPARAÎT. Et toi… LES MAINS VIDES. » */
export const V5Stake: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const gone = atPart("dec5", 2);
  const fade = 1 - progress(t, gone, 0.4);
  const empty = pop(t, atPart("etToi", 2));
  const ground = 1460;
  return (
    <Stage>
      <Moon x={860} y={740} r={36} />
      <Sea t={t} horizon={1230} moonX={860} />
      <Beam x={540} bottom={800} opacity={0.85} />
      <Beach y={ground - 6} t={t} />
      <CalendarCard
        x={540}
        y={1020}
        day={5}
        w={230}
        opacity={1 - progress(t, at("etToi"), 0.4)}
      />
      <Token
        x={540}
        y={820 + wave(t, 2.2) * 8}
        r={110 * pop(t, 0.05)}
        spin={t * 14}
        rays={0.7 * fade}
        glow={fade}
        opacity={fade}
      />
      <Burst
        x={540}
        y={820}
        elapsed={t - gone}
        count={110}
        spread={320}
        rise={260}
        duration={1.1}
        seed="v5gone"
      />
      {/* Les mains vides */}
      <Figure
        x={540}
        y={ground - LEG}
        hero
        pose={blendPose(
          STAND,
          { ...STAND, armL: [-70, -120], armR: [70, 120], nod: 14 },
          empty,
        )}
        opacity={progress(t, at("etToi"), 0.3)}
      />
    </Stage>
  );
};

/* 2. « Demain, t'as cours ? FAIS UN BLOCUS. Revendication : LE JETON. Lycée bloqué, pas de cours. » */
export const V5Gate: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1520;
  const banner = progress(t, at("revendication") + 0.4, 0.4);
  const lock = pop(t, at("bloque"), 200);
  const slam = at("blocus");
  const jolt = t > slam && t < slam + 0.3 ? shake(t, 8, 7) : 0;
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.7} />
      <Floor y={ground} t={t} />
      <g transform={`translate(${jolt} 0)`}>
        <Gate x={540} y={ground} lock={lock} />
        <Banner x={540} y={ground - 300} p={banner} t={t} />
      </g>
      {[200, 330, 750, 880].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={ground + 60 - LEG * 0.8}
          scale={0.8}
          hero={i === 1}
          pose={{
            ...STAND,
            armR: [150 + wave(t, 0.6, i) * 10, 170],
            armL: [-20, -10],
          }}
          opacity={pop(t, slam + i * 0.08)}
        />
      ))}
    </Stage>
  );
};

/* 3. « Tu rentres chez toi, tu lances une partie. » ---------------------- */
export const V5Home: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1460;
  const play = atPart("maison", 1);
  const heroX = mix(
    140,
    560,
    progress(t, 0, play, (v) => v),
  );
  const on = pop(t, play + 0.1);
  return (
    <Stage>
      <Beam x={780} bottom={700} opacity={0.6} />
      <Floor y={ground} t={t} />
      <House x={790} y={ground} />
      <Figure
        x={heroX}
        y={ground - LEG}
        hero
        pose={
          t < play
            ? walkPose(t * 1.7, 24)
            : { ...STAND, armR: [60, 90], armL: [-60, -90] }
        }
      />
      <g transform={`translate(${heroX} 1260)`} opacity={on}>
        <Controller x={0} y={0} scale={0.22} lit={on} />
      </g>
      {on > 0 ? (
        <circle
          cx={heroX}
          cy={1260}
          r={160}
          fill="url(#goldHalo)"
          opacity={on * 0.6}
        />
      ) : null}
    </Stage>
  );
};

/* 4. « Ta mère demande pourquoi t'es déjà là ? « REVENDICATIONS. » » ---- */
export const V5Mother: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1480;
  const ask = pop(t, 0.3);
  const sign = pop(t, at("revendications"), 200);
  return (
    <Stage>
      <Beam x={300} bottom={600} opacity={0.6} />
      <Floor y={ground} t={t} />
      {/* Porte ouverte, la mère dans l'encadrement */}
      <rect
        x={150}
        y={900}
        width={300}
        height={580}
        fill="#f2d9a6"
        opacity={0.18}
      />
      <rect
        x={150}
        y={900}
        width={300}
        height={580}
        fill="none"
        stroke={palette.line}
        strokeWidth={6}
      />
      <Figure
        x={300}
        y={ground - LEG * 1.05}
        scale={1.05}
        facing={1}
        pose={{ ...STAND, armL: [-40, -100], armR: [40, 100], nod: -6 }}
        color={palette.mate}
      />
      <SpeechBubble
        x={320}
        y={760}
        w={180}
        h={130}
        tailX={300}
        tailY={870}
        opacity={ask}
      >
        <text
          x={320}
          y={790}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={90}
          fill={palette.line}
        >
          ?
        </text>
      </SpeechBubble>
      {/* Le héros brandit sa pancarte */}
      <Figure
        x={760}
        y={ground - LEG}
        hero
        facing={-1}
        pose={blendPose(
          STAND,
          { ...STAND, armR: [160, 175], armL: [-160, -175] },
          sign,
        )}
      />
      {sign > 0 ? (
        <g
          transform={`translate(760 ${1080 - sign * 20}) rotate(${wave(t, 0.8) * 4}) scale(${sign})`}
        >
          <line
            x1={0}
            y1={60}
            x2={0}
            y2={210}
            stroke={palette.line}
            strokeWidth={8}
          />
          <rect
            x={-170}
            y={-60}
            width={340}
            height={120}
            rx={10}
            fill="#f4efe0"
            stroke={palette.line}
            strokeWidth={4}
          />
          <text
            y={14}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={34}
            fill="#c8321e"
          >
            REVENDICATIONS
          </text>
        </g>
      ) : null}
    </Stage>
  );
};

/* 5. « Ton petit frère veut la télé ? Une partie contre UNE VAISSELLE. » */
export const V5Brother: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1480;
  const deal = pop(t, atPart("vaisselle", 1));
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.6} />
      <Floor y={ground} t={t} />
      <Monitor x={540} y={ground - 40} w={420} h={260} glow={0.7} />
      <Figure
        x={290}
        y={ground - LEG * 0.7}
        scale={0.7}
        pose={{ ...STAND, armR: [110, 120], nod: -10 }}
        color={palette.mate}
      />
      <Figure
        x={800}
        y={ground - LEG}
        hero
        facing={-1}
        pose={blendPose(STAND, { ...STAND, armR: [80, 100] }, deal)}
      />
      {/* La pile d'assiettes */}
      <g
        transform={`translate(540 ${1000 - deal * 20}) scale(${deal})`}
        opacity={deal}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={0}
            cy={-i * 22}
            rx={110}
            ry={22}
            fill="#e8eeff"
            stroke={palette.ink}
            strokeWidth={3}
          />
        ))}
        <rect
          x={80}
          y={-150}
          width={70}
          height={44}
          rx={10}
          fill="#ffd34d"
          stroke={palette.ink}
          strokeWidth={3}
        />
        <text
          y={110}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={34}
          fill={palette.line}
        >
          ton tour
        </text>
      </g>
    </Stage>
  );
};

/* 6. « Des devoirs ? Tu les feras LE 6. » -------------------------------- */
export const V5Homework: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const push = progress(t, atPart("le6", 1) - 0.1, 0.5);
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.6} />
      <Floor y={1500} t={t} />
      <g
        transform={`translate(${mix(480, 300, push)} 1100) rotate(${mix(-4, -16, push)})`}
      >
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={-150 + i * 10}
            y={-200 - i * 12}
            width={300}
            height={400}
            rx={10}
            fill={palette.inkLight}
            stroke={palette.line}
            strokeWidth={4}
          />
        ))}
        <text
          x={20}
          y={-110}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={50}
          fill={palette.line}
        >
          DEVOIRS
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={-100}
            y1={-40 + i * 50}
            x2={150}
            y2={-40 + i * 50}
            stroke={palette.lineFaint}
            strokeWidth={4}
          />
        ))}
      </g>
      <g
        transform={`translate(760 1080) scale(${pop(t, atPart("le6", 1))}) rotate(6)`}
      >
        <CalendarCard x={0} y={0} day={6} w={240} highlight />
      </g>
    </Stage>
  );
};

/* 7. « Ton équipe ? Elle aussi a fait LE BLOCUS. EN VOCAL… TOUTE L'ÉQUIPE L'A. » */
export const V5Team: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const cardY = 1100;
  const tags = (i: number) => pop(t, atPart("aussi", 1) + i * 0.1);
  const talk = progress(t, at("vocal"), 0.3);
  const share = atPart("toute", 1);
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.7} />
      <line
        x1={60}
        y1={1420}
        x2={1020}
        y2={1420}
        stroke={palette.lineFaint}
        strokeWidth={3}
      />
      {SQUAD.map((m, i) => {
        const tok = progress(t, share + i * 0.08, 0.35);
        return (
          <g key={m.name}>
            <SquadCard
              x={SQUAD_X[i]}
              y={cardY}
              name={m.name}
              hero={m.hero}
              online={1}
              gold={tok}
              t={t}
            />
            <g
              transform={`translate(${SQUAD_X[i]} ${cardY - 190}) rotate(-8) scale(${tags(i)})`}
              opacity={tags(i)}
            >
              <rect
                x={-80}
                y={-24}
                width={160}
                height={48}
                rx={8}
                fill="#f4efe0"
                stroke={palette.line}
                strokeWidth={3}
              />
              <text
                y={11}
                textAnchor="middle"
                fontFamily={impactFont}
                fontWeight={900}
                fontSize={26}
                fill="#c8321e"
              >
                BLOCUS
              </text>
            </g>
            <VoiceWave
              x={SQUAD_X[i]}
              y={1330}
              t={t}
              level={talk * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.4 + i * 2)))}
              seed={i * 3}
              color={m.hero ? palette.hero : palette.mate}
            />
            {tok > 0 ? (
              <Token
                x={SQUAD_X[i]}
                y={840}
                r={46 * tok}
                spin={t * 25}
                rays={0.4 * tok}
              />
            ) : null}
          </g>
        );
      })}
    </Stage>
  );
};

/* 8. « Midi : RIEN. Seize heures : RIEN. Vingt-deux heures : ENCORE RIEN. » */
export const V5Day: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1520;
  const steps = [
    { at: at("midi"), part: atPart("midi", 1), hour: 0 },
    { at: at("seize"), part: atPart("seize", 1), hour: 120 },
    { at: at("vingtDeux"), part: atPart("vingtDeux", 1), hour: 300 },
  ];
  const idx = Math.max(0, steps.filter((s) => t >= s.at).length - 1);
  const step = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  const hour = mix(prev.hour, step.hour, progress(t, step.at, 0.5));
  const open = Math.max(
    ...steps.map((s, i) =>
      inOut(t, s.part - 0.15, (steps[i + 1]?.at ?? 99) - 0.05, 0.15, 0.2),
    ),
  );
  const dark = progress(t, at("vingtDeux"), 0.6);
  return (
    <Stage>
      <rect
        x={0}
        y={0}
        width={1080}
        height={1920}
        fill="#ffd9a0"
        opacity={0.08 * (1 - dark)}
      />
      <Beam x={540} bottom={900} opacity={0.6} />
      <Floor y={ground} t={t} />
      <Clock x={540} y={960} r={190} hour={hour} minute={0} />
      <Pool x={540} y={ground} rx={300} ry={46} />
      <Chest x={540} y={ground} w={320} open={open} />
      {steps.map((s, i) => (
        <Burst
          key={i}
          x={540}
          y={ground - 200}
          elapsed={t - s.part}
          count={30}
          spread={150}
          rise={100}
          duration={0.8}
          seed={`v5day${i}`}
          color="#9aa8cc"
        />
      ))}
    </Stage>
  );
};

/* 9. « 23:59. Un dernier coffre… et IL EST LÀ. » ------------------------ */
export const V5Last: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1520;
  const reveal = atPart("estLa", 1);
  const crack = progress(t, at("dernier") + 0.4, 0.8);
  const rise = progress(t, reveal, 0.6);
  const pulse = 0.35 + 0.2 * wave(t, 1.1);
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.5} />
      <Floor y={ground} t={t} />
      <g
        transform={`translate(540 ${880 - rise * 120}) scale(${1 - rise * 0.4})`}
        opacity={1 - rise * 0.6}
      >
        <rect
          x={-200}
          y={-80}
          width={400}
          height={160}
          rx={30}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        <text
          y={44}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={120}
          fill={palette.goldLight}
        >
          23:59
        </text>
      </g>
      <circle
        cx={540}
        cy={1300}
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
        y={1300}
        elapsed={t - reveal}
        count={120}
        spread={380}
        rise={360}
        duration={1.4}
        seed="v5reveal"
      />
      {rise > 0 ? (
        <Token
          x={540}
          y={mix(1330, 1010, rise)}
          r={140}
          spin={t * 18}
          rays={0.9}
          glow={1}
        />
      ) : null}
    </Stage>
  );
};

/* 10. « Le 5 décembre, le jeton disparaît… sauf pour ceux qui ont fait LE BLOCUS. » */
export const V5Final: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1520;
  const cheer = pop(t, atPart("sauf", 1), 150);
  const xs = [250, 430, 650, 830];
  return (
    <Stage>
      <Beam x={540} bottom={1100} opacity={0.85} />
      <Floor y={ground} t={t} />
      <Pool
        x={540}
        y={ground}
        rx={460}
        ry={60}
        gold
        opacity={0.5 + cheer * 0.4}
      />
      <Banner x={540} y={1250} w={560} p={1} t={t} text="BLOCUS" />
      {xs.map((x, i) => {
        const pose: Pose = blendPose(
          { ...STAND, nod: -10 },
          {
            ...STAND,
            armR: [160, 175],
            armL: i === 1 ? [-160, -175] : [-20, -10],
            nod: -14,
          },
          cheer,
        );
        return (
          <g key={x}>
            <Token
              x={x}
              y={920 + wave(t, 2, i * 0.4) * 10}
              r={58 * pop(t, 0.05 + i * 0.1)}
              spin={t * 20 + i * 20}
              rays={0.4 + cheer * 0.4}
            />
            <Figure x={x} y={ground - LEG} hero={i === 1} pose={pose} />
          </g>
        );
      })}
      <Dust
        t={t}
        area={[120, 700, 840, 700]}
        color={palette.goldLight}
        opacity={0.6 + cheer * 0.3}
        count={60}
      />
    </Stage>
  );
};
