/**
 * Scènes de la vidéo 3 (« ceux qui restent ») : ceux qui lâchent, celui qui
 * revient, les deux futurs, le choix final. Même grammaire visuelle.
 */
import { bodyFont, impactFont } from "../fonts";
import { easeInOut, mix, pop, progress, shake, wave } from "../lib/anim";
import { Stage, useSceneTime } from "../lib/scene";
import { palette } from "../theme";
import {
  Figure,
  LEG,
  SIT,
  STAND,
  Token,
  blendPose,
  walkPose,
} from "../components/art/Characters";
import {
  Beam,
  Burst,
  Dust,
  Moon,
  Pool,
  Sea,
} from "../components/art/Environment";
import {
  Bed,
  CalendarCard,
  Chest,
  Clock,
  Hourglass,
  SquadCard,
  ThoughtBubble,
} from "../components/art/Props";
import { SQUAD, SQUAD_X } from "../scenes/Act1";
import { Beach, Floor } from "../scenes/common";
import { GameScreen, Lighthouse } from "../v2/props";

/** Dé à jouer (vue de face). */
const Dice: React.FC<{ x: number; y: number; s?: number; rotate?: number }> = ({
  x,
  y,
  s = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
    <rect
      x={-40}
      y={-40}
      width={80}
      height={80}
      rx={16}
      fill="#f1f4ff"
      stroke={palette.line}
      strokeWidth={4}
    />
    {[
      [-20, -20],
      [20, -20],
      [0, 0],
      [-20, 20],
      [20, 20],
    ].map(([px, py]) => (
      <circle key={`${px}${py}`} cx={px} cy={py} r={7} fill={palette.ink} />
    ))}
  </g>
);

/** Croix rouge (refus, échec). */
const Cross: React.FC<{ x: number; y: number; s?: number; p?: number }> = ({
  x,
  y,
  s = 1,
  p = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={p}>
    <path
      d={`M-40,-40 L${-40 + 80 * p},${-40 + 80 * p} M40,-40 L${40 - 80 * p},${-40 + 80 * p}`}
      stroke="#ff6b5a"
      strokeWidth={12}
      strokeLinecap="round"
      filter="url(#glow)"
    />
  </g>
);

/* 1. « Tu as ABANDONNÉ le jeton pirate. Comme presque tout le monde… » --- */
export const V3Leave: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1470;
  const chests = pop(t, at("vides"));
  const walkers = [
    { x0: 760, speed: 70, s: 0.9, hero: false, phase: 0 },
    { x0: 880, speed: 64, s: 0.85, hero: false, phase: 0.3 },
    { x0: 980, speed: 74, s: 0.95, hero: false, phase: 0.6 },
    { x0: 620, speed: 52, s: 1, hero: true, phase: 0.15 },
    { x0: 1080, speed: 68, s: 0.8, hero: false, phase: 0.45 },
    { x0: 1180, speed: 72, s: 0.9, hero: false, phase: 0.8 },
  ];
  return (
    <Stage>
      <Moon x={860} y={740} r={34} opacity={0.8} />
      <Sea t={t} horizon={1230} moonX={860} opacity={0.85} />
      <Beam x={540} bottom={900} opacity={0.55} />
      <Beach y={ground - 6} t={t} />
      {[230, 560, 870].map((x, i) => (
        <g key={x} opacity={chests * 0.85}>
          <Chest x={x} y={ground + 40 - i * 10} w={150 - i * 10} open={0.7} />
        </g>
      ))}
      {walkers.map((w, i) => {
        const x = w.x0 - t * w.speed;
        return (
          <Figure
            key={i}
            x={x}
            y={ground - LEG * w.s + 30}
            scale={w.s}
            facing={-1}
            hero={w.hero}
            pose={{ ...walkPose(t * 1.3 + w.phase, 18), nod: 22 }}
            opacity={w.hero ? 1 : 0.55}
          />
        );
      })}
    </Stage>
  );
};

/* 2. « Tu t'es dit : C'est de la chance, c'est pas pour moi. » --------- */
export const V3Doubt: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1470;
  const bubble = pop(t, at("chance"));
  const no = progress(t, at("pasPourMoi") + 0.3, 0.3);
  return (
    <Stage>
      <Moon x={860} y={740} r={34} />
      <Sea t={t} horizon={1250} moonX={860} />
      <Beam x={420} bottom={700} opacity={0.6} />
      <Beach y={ground - 6} t={t} />
      {/* Rocher où il est assis */}
      <path
        d="M260,1470 C270,1400 420,1380 470,1470 Z"
        fill={palette.ink}
        stroke={palette.line}
        strokeWidth={5}
      />
      <Figure
        x={380}
        y={1392}
        hero
        pose={{ ...SIT, armL: [40, 140], armR: [44, 150], nod: 34, lean: 22 }}
      />
      <ThoughtBubble
        x={620}
        y={1030}
        w={300}
        h={190}
        tailX={440}
        tailY={1270}
        opacity={bubble}
      >
        <Dice x={560} y={1030} s={bubble} rotate={wave(t, 1.4) * 10} />
        <Token
          x={680}
          y={1030}
          r={46 * bubble}
          spin={t * 20}
          glow={0.4}
          rays={0}
        />
        <Cross x={680} y={1030} s={0.8} p={no} />
      </ThoughtBubble>
    </Stage>
  );
};

/* 3. « ÉCOUTE-MOI BIEN. Le jeton ne récompense pas les plus forts. Il récompense CEUX QUI RESTENT. » */
export const V3Reward: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1460;
  const strong = pop(t, at("forts") + 0.6);
  const stay = atPart("restent", 1);
  const leave = progress(t, stay, 0.9);
  const crown = pop(t, stay + 0.1);
  const xs = [190, 360, 540, 720, 890];
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.5 + leave * 0.2} />
      <Beam x={540} y={-60} top={80} bottom={360} opacity={leave} />
      <Floor y={ground} t={t} />
      <Pool x={540} y={ground} rx={180} ry={36} gold opacity={leave} />
      {xs.map((x, i) => {
        const isHero = i === 2;
        const isStrong = i === 3;
        if (isHero) {
          return (
            <Figure
              key={x}
              x={x}
              y={ground - LEG}
              hero
              pose={blendPose(STAND, { ...STAND, nod: -10 }, leave)}
            />
          );
        }
        const s = isStrong ? 1.35 : 1;
        const dx = (x < 540 ? -1 : 1) * leave * 260;
        return (
          <Figure
            key={x}
            x={x + dx}
            y={ground - LEG * s}
            scale={s}
            facing={x < 540 ? -1 : 1}
            pose={
              leave > 0.02
                ? walkPose(t * 1.4 + i * 0.2, 18)
                : { ...STAND, armL: [-30, -60], armR: [30, 60] }
            }
            opacity={(1 - leave) * 0.75}
          />
        );
      })}
      {/* Le plus fort : pas de récompense */}
      <Cross
        x={720 + leave * 260}
        y={1060}
        s={0.7 * strong}
        p={strong * (1 - leave)}
      />
      <Token
        x={540}
        y={1050 - crown * 20}
        r={70 * crown}
        spin={t * 30}
        rays={0.6 * crown}
      />
      <Burst
        x={540}
        y={1050}
        elapsed={t - stay}
        count={60}
        spread={200}
        rise={180}
        duration={1.1}
        seed="stay"
      />
    </Stage>
  );
};

/* 4. « Pendant que les autres lâchent, toi, TU PEUX REVENIR. » ---------- */
export const V3Return: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1470;
  const turn = atPart("revenir", 1);
  const back = t > turn;
  const heroX = back ? 470 + (t - turn) * 110 : 470 - t * 40;
  return (
    <Stage>
      <Moon x={880} y={740} r={36} />
      <Sea t={t} horizon={1230} moonX={880} />
      <Beam x={heroX} bottom={500} opacity={back ? 0.9 : 0.3} />
      <Beach y={ground - 6} t={t} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Figure
          key={i}
          x={360 + i * 140 - t * (70 + i * 6)}
          y={ground - LEG * 0.9 + 20}
          scale={0.9}
          facing={-1}
          pose={{ ...walkPose(t * 1.3 + i * 0.27, 18), nod: 20 }}
          opacity={0.4}
        />
      ))}
      <Figure
        x={heroX}
        y={ground - LEG}
        hero
        facing={back ? 1 : -1}
        pose={
          back ? walkPose(t * 1.6, 26) : { ...walkPose(t * 1.2, 14), nod: 20 }
        }
      />
      {back ? (
        <Pool x={heroX} y={ground} rx={140} ry={30} gold opacity={0.7} />
      ) : null}
    </Stage>
  );
};

/* 5. « Et chaque soir où tu reviens, TU TE RAPPROCHES. » --------------- */
export const V3Closer: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1400;
  const nights = 4;
  const end = at("rapproches") + 0.3;
  const p = progress(t, 0.2, end - 0.2, (v) => v);
  const step = Math.min(nights, Math.floor(p * nights + 0.001));
  const sub = p * nights - step;
  const x0 = 170;
  const x1 = 780;
  const heroX = mix(
    x0,
    x1,
    (step + easeInOut(Math.min(1, sub * 1.6))) / nights,
  );
  const close = (heroX - x0) / (x1 - x0);
  return (
    <Stage>
      <Beam x={900} bottom={500} opacity={0.4 + close * 0.6} />
      <Floor y={ground} t={t} />
      {/* Chemin des nuits */}
      <line
        x1={x0}
        y1={ground + 30}
        x2={960}
        y2={ground + 30}
        stroke={palette.lineFaint}
        strokeWidth={4}
        strokeDasharray="10 16"
      />
      {Array.from({ length: nights }, (_, i) => {
        const x = mix(x0, x1, (i + 1) / nights);
        const done = step > i;
        return (
          <g key={i} transform={`translate(${x} ${ground + 90})`}>
            <circle
              r={24}
              fill={done ? palette.goldLight : palette.ink}
              stroke={palette.line}
              strokeWidth={4}
            />
            <circle
              cx={9}
              cy={-6}
              r={18}
              fill={done ? palette.gold : palette.ink}
              opacity={done ? 0.0 : 1}
            />
          </g>
        );
      })}
      <Token
        x={920}
        y={1150}
        r={40 + close * 70}
        spin={t * 20}
        glow={0.3 + close * 0.8}
        rays={close * 0.7}
      />
      <Figure
        x={heroX}
        y={ground - LEG}
        hero
        pose={sub < 0.6 && step < nights ? walkPose(t * 1.8, 24) : STAND}
      />
    </Stage>
  );
};

/* 6. « Pas besoin d'y passer la nuit. 30 MINUTES ce soir. 30 MINUTES demain. Avec ton équipe. » */
const Timer: React.FC<{
  x: number;
  y: number;
  p: number;
  label: string;
  show: number;
}> = ({ x, y, p, label, show }) => {
  const r = 120;
  const a = p * Math.PI * 2;
  const end = [Math.sin(a) * r, -Math.cos(a) * r];
  return (
    <g transform={`translate(${x} ${y}) scale(${show})`} opacity={show}>
      <circle
        r={r}
        fill={palette.ink}
        stroke={palette.lineFaint}
        strokeWidth={14}
      />
      {p > 0.001 ? (
        <path
          d={`M0,${-r} A${r},${r} 0 ${p > 0.5 ? 1 : 0} 1 ${end[0]},${end[1]}`}
          fill="none"
          stroke={palette.gold}
          strokeWidth={14}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      ) : null}
      <text
        y={20}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={64}
        fill={palette.goldLight}
      >
        30:00
      </text>
      <rect
        x={-90}
        y={150}
        width={180}
        height={52}
        rx={26}
        fill={palette.ink}
        stroke={palette.line}
        strokeWidth={4}
      />
      <text
        y={186}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={28}
        fill={palette.line}
      >
        {label}
      </text>
    </g>
  );
};

export const V3Timer: React.FC = () => {
  const { t, at } = useSceneTime();
  const noNight = pop(t, 0.1);
  const t1 = pop(t, at("trente1"));
  const t2 = pop(t, at("trente2"));
  const team = pop(t, at("avecEquipe"));
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.6} />
      <g opacity={1 - t1}>
        <Bed x={540} y={1150} w={380} />
        <Cross x={540} y={1060} s={1.1} p={progress(t, 0.5, 0.4)} />
      </g>
      <Timer
        x={330}
        y={960}
        p={progress(t, at("trente1"), 3.2, (v) => v)}
        label="CE SOIR"
        show={t1 * noNight}
      />
      <Timer
        x={750}
        y={960}
        p={progress(t, at("trente2"), 2.2, (v) => v)}
        label="DEMAIN"
        show={t2}
      />
      {SQUAD.map((m, i) => (
        <g
          key={m.name}
          opacity={team}
          transform={`translate(0 ${(1 - team) * 60})`}
        >
          <SquadCard
            x={SQUAD_X[i]}
            y={1400}
            w={150}
            name={m.name}
            hero={m.hero}
            online={1}
            t={t}
          />
        </g>
      ))}
    </Stage>
  );
};

/* 7. « Un seul d'entre vous le trouve, et TOUTE L'ÉQUIPE l'a. » --------- */
export const V3Team: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1460;
  const xs = [250, 430, 650, 830];
  const found = pop(t, 0.6);
  const share = atPart("touteEquipe", 1);
  return (
    <Stage>
      <Moon x={170} y={740} r={34} />
      <Sea t={t} horizon={1220} moonX={170} />
      <Beam
        x={xs[2]}
        bottom={360}
        opacity={1 - progress(t, share, 0.4) * 0.5}
      />
      <Beam x={540} bottom={1000} opacity={progress(t, share, 0.4) * 0.8} />
      <Beach y={ground - 4} t={t} />
      {xs.map((x, i) => {
        const p =
          i === 2 ? found : progress(t, share + Math.abs(i - 2) * 0.08, 0.45);
        const tx = i === 2 ? x : mix(xs[2], x, p);
        const ty = 1000 - (i === 2 ? found * 30 : Math.sin(p * Math.PI) * 120);
        return (
          <g key={x}>
            <Figure
              x={x}
              y={ground - LEG}
              hero={i === 1}
              pose={
                i === 2
                  ? blendPose(
                      STAND,
                      { ...STAND, armR: [150, 165], armL: [-150, -165] },
                      found,
                    )
                  : STAND
              }
            />
            {p > 0 ? (
              <Token
                x={tx}
                y={ty + wave(t, 2, i) * 5}
                r={62 * Math.min(1, p * 1.4)}
                spin={t * 30}
                rays={0.4 * p}
              />
            ) : null}
          </g>
        );
      })}
    </Stage>
  );
};

/* 8. « Imagine le 5 décembre. Le jeton disparaît. Tes potes l'ont… et toi, TU REGARDES. » */
export const V3Dark: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1460;
  const mates = pop(t, at("potes"));
  const watch = progress(t, atPart("regardes", 1), 0.4);
  return (
    <Stage>
      <Beam x={760} bottom={700} opacity={0.4 + mates * 0.4} />
      <Floor y={ground} t={t} />
      {/* Pluie froide */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = (i * 73) % 1100;
        const y = ((i * 211 + t * 900) % 1300) + 600;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - 10}
            y2={y + 40}
            stroke="#8fa3d6"
            strokeWidth={2}
            opacity={0.25}
          />
        );
      })}
      <CalendarCard x={200} y={860} day={5} w={170} opacity={0.8} rotate={-6} />
      {[620, 760, 900].map((x, i) => (
        <g key={x}>
          <Figure
            x={x}
            y={ground - LEG}
            pose={{ ...STAND, armR: [150, 165], nod: -12 }}
            opacity={0.9}
          />
          <Token
            x={x + 30}
            y={1120 + wave(t, 2, i) * 6}
            r={42 * mates}
            spin={t * 20}
            rays={0.3}
          />
        </g>
      ))}
      <Figure
        x={230}
        y={ground - LEG}
        hero
        pose={{ ...STAND, armL: [-4, -2], armR: [4, 2], nod: 20 + watch * 10 }}
        opacity={1 - watch * 0.55}
      />
      <rect
        x={0}
        y={0}
        width={1080}
        height={1920}
        fill="#02040b"
        opacity={watch * 0.35}
      />
    </Stage>
  );
};

/* 9. « Ou alors, imagine l'autre version. Le 4 décembre, tard. » -------- */
export const V3LastNight: React.FC = () => {
  const { t, at } = useSceneTime();
  const warm = progress(t, at("autreVersion"), 0.8);
  const spin = progress(t, at("dec4"), 1.4, easeInOut);
  return (
    <Stage>
      <Moon x={170} y={740} r={34} />
      <Sea t={t} horizon={1250} moonX={170} />
      <Lighthouse x={820} y={1260} h={420} sweep={t * 60} beam={warm} />
      <Beach y={1480} t={t} />
      <g transform={`translate(380 1070) scale(${pop(t, at("dec4"))})`}>
        <Clock
          x={0}
          y={0}
          r={170}
          hour={mix(300, 350, spin)}
          minute={mix(0, 600, spin)}
        />
      </g>
      <CalendarCard
        x={220}
        y={1380}
        day={4}
        w={170}
        opacity={pop(t, at("dec4"))}
        rotate={-6}
      />
    </Stage>
  );
};

/* 10. « Un coffre de plus. Le dernier de la soirée. Tu l'ouvres… et IL EST LÀ. » */
export const V3Found: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1520;
  const crack = progress(t, at("ouvres") + 0.1, 0.5);
  const reveal = atPart("estLa", 1);
  const rise = progress(t, reveal, 0.6, easeInOut);
  const pulse = 0.4 + 0.2 * wave(t, 1.1);
  return (
    <Stage>
      <Lighthouse x={880} y={1250} h={460} sweep={t * 60} />
      <Beam x={540} bottom={900} opacity={0.5} />
      <Beach y={ground - 6} t={t} />
      <circle
        cx={540}
        cy={1250}
        r={600}
        fill="url(#goldHalo)"
        opacity={rise * 0.7}
      />
      <Pool
        x={540}
        y={ground}
        rx={300}
        ry={50}
        gold
        opacity={pulse + crack * 0.5}
      />
      <Chest x={540} y={ground} w={420} open={crack} light={pulse + crack} />
      {[220, 330].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={ground - LEG}
          pose={STAND}
          opacity={0.75 - i * 0.1}
        />
      ))}
      <Figure
        x={770}
        y={ground - LEG}
        hero
        facing={-1}
        pose={blendPose(
          STAND,
          { ...STAND, armR: [100, 110], lean: 12, nod: 14 },
          pop(t, at("ouvres")),
        )}
      />
      <Burst
        x={540}
        y={1300}
        elapsed={t - reveal}
        count={110}
        spread={360}
        rise={340}
        duration={1.4}
        seed="v3found"
      />
      {rise > 0 ? (
        <Token
          x={540}
          y={mix(1330, 1000, rise)}
          r={140}
          spin={t * 18}
          rays={0.9}
          glow={1}
        />
      ) : null}
    </Stage>
  );
};

/* 11. « RELANCE LE JEU. RAPPELLE TON ÉQUIPE. » ------------------------ */
export const V3Relaunch: React.FC = () => {
  const { t, at } = useSceneTime();
  const press = pop(t, 0.2);
  const call = progress(t, at("rappelle"), 0.25);
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.8} />
      <g transform="translate(540 930) scale(0.82)">
        <circle r={430} fill="url(#goldHalo)" opacity={press * 0.6} />
        <GameScreen x={0} y={0} crossed={0} mission={0} />
        <rect
          x={-150}
          y={-46}
          width={300}
          height={92}
          rx={46}
          fill={palette.gold}
          opacity={press}
          filter="url(#glowStrong)"
        />
        <text
          y={18}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={52}
          fill={palette.ink}
          opacity={press}
        >
          JOUER
        </text>
      </g>
      {SQUAD.map((m, i) => {
        const on = progress(t, at("rappelle") + i * 0.15, 0.2);
        return (
          <g key={m.name} opacity={0.3 + call * 0.7}>
            <SquadCard
              x={SQUAD_X[i]}
              y={1390}
              w={160}
              name={m.name}
              hero={m.hero}
              online={on}
              dim={(1 - on) * 0.6}
              t={t}
            />
          </g>
        );
      })}
    </Stage>
  );
};

/* 12. « Le 5 décembre N'ATTEND PERSONNE. » ------------------------------ */
export const V3Deadline: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const slam = atPart("attendPas", 1);
  const hit = t > slam && t < slam + 0.35 ? shake(t, 10, 6) : 0;
  const cal = pop(t, slam - 0.1);
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.8} />
      <Pool x={540} y={1500} rx={380} ry={56} />
      <Hourglass
        x={260}
        y={1150}
        h={420}
        level={1 - progress(t, 0, 2.0, (v) => v)}
        t={t * 3}
      />
      <g transform={`translate(${700 + hit} 1100) scale(${cal})`}>
        <circle r={300} fill="url(#goldHalo)" opacity={t > slam ? 0.8 : 0.2} />
        <CalendarCard x={0} y={0} day={5} w={320} highlight={t > slam} />
      </g>
    </Stage>
  );
};

/* 13. « Ceux qui abandonnent REGARDENT. Ceux qui restent LE GAGNENT. Toi, TU CHOISIS QUOI ? » */
export const V3Choice: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1580;
  const left = progress(t, 0.1, 0.5);
  const right = progress(t, at("gagnent"), 0.5);
  const choose = atPart("choisis", 1);
  const go = progress(t, choose, 1.4, easeInOut);
  const heroX = mix(540, 690, go);
  const heroY = mix(ground - LEG, ground - LEG - 120, go);
  return (
    <Stage>
      <Beam x={820} bottom={700} opacity={0.3 + right * 0.7} />
      <Floor y={ground} t={t} />
      {/* Deux chemins depuis la fourche */}
      <path
        d={`M540,${ground} C470,1400 300,1300 210,1150`}
        fill="none"
        stroke={palette.lineFaint}
        strokeWidth={36}
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d={`M540,${ground} C610,1400 760,1300 840,1150`}
        fill="none"
        stroke={palette.gold}
        strokeWidth={36}
        strokeLinecap="round"
        opacity={0.25 + right * 0.6}
        filter="url(#glow)"
      />
      {/* Côté abandon : ceux qui regardent */}
      <g opacity={left * (1 - right * 0.4)}>
        {[160, 250].map((x) => (
          <Figure
            key={x}
            x={x}
            y={1120 - LEG * 0.8}
            scale={0.8}
            pose={{ ...STAND, armL: [-4, -2], armR: [4, 2], nod: 22 }}
            opacity={0.6}
          />
        ))}
        <text
          x={205}
          y={1230}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={800}
          fontSize={30}
          fill={palette.lineSoft}
          letterSpacing={3}
        >
          ABANDONNER
        </text>
      </g>
      {/* Côté rester : le jeton */}
      <g opacity={0.3 + right * 0.7}>
        <Token
          x={850}
          y={1010}
          r={80}
          spin={t * 20}
          rays={right * 0.9}
          glow={right}
        />
        <text
          x={850}
          y={1230}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={800}
          fontSize={30}
          fill={palette.goldLight}
          letterSpacing={3}
        >
          RESTER
        </text>
      </g>
      <Figure
        x={heroX}
        y={heroY}
        hero
        scale={1 - go * 0.15}
        pose={go > 0.01 && go < 0.99 ? walkPose(t * 1.6, 22) : STAND}
      />
      <Dust
        t={t}
        area={[600, 900, 400, 600]}
        color={palette.goldLight}
        opacity={right * 0.8}
      />
    </Stage>
  );
};
