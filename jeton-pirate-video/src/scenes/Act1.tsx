/**
 * Acte 1 (0 → 16,9 s) : le jeton disparaît, reprends ta manette,
 * rappelle tes potes, celui qui ne répond pas.
 */
import { impactFont } from "../fonts";
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
  Controller,
  Phone,
  Signpost,
  Sofa,
  SquadCard,
  ThoughtBubble,
} from "../components/art/Props";
import { Badge, Beach, Floor } from "./common";

/* ------------------------------------------------------------------ */
/* 1. « Le 5 décembre, le jeton pirate DISPARAÎT. »                     */
/* ------------------------------------------------------------------ */

export const SceneOpening: React.FC = () => {
  const { t, at } = useSceneTime();
  const gone = at("disparait");
  const appear = pop(t, 0.05);
  const fade = 1 - progress(t, gone, 0.45);
  const tokenY = 930 + wave(t, 2.4) * 10 - progress(t, gone, 0.5) * 40;
  return (
    <Stage>
      <Moon x={860} y={720} r={38} />
      <Sea t={t} horizon={1240} moonX={860} />
      <Beam x={540} bottom={760} opacity={0.9} />
      {/* Calendriers fantômes, au loin sur l'eau */}
      <CalendarCard
        x={150}
        y={1200}
        day={12}
        w={120}
        opacity={0.22}
        rotate={-6}
      />
      <CalendarCard
        x={935}
        y={1190}
        day={19}
        w={120}
        opacity={0.22}
        rotate={5}
      />
      <Beach y={1430} t={t} />
      <Pool x={540} y={1450} rx={360} ry={60} />
      <Signpost x={540} y={1450} h={170}>
        <CalendarCard x={0} y={-60} day={5} w={240} />
      </Signpost>
      <Figure
        x={250}
        y={1462 - LEG * 0.8}
        scale={0.8}
        hero
        pose={{ ...STAND, nod: -12 }}
      />
      <Token
        x={540}
        y={tokenY}
        r={125 * appear}
        spin={t * 12}
        rays={0.9 * fade}
        glow={fade}
        opacity={fade}
      />
      <Burst
        x={540}
        y={930}
        elapsed={t - gone}
        count={110}
        spread={330}
        rise={260}
        duration={1.1}
        seed="open"
      />
      <Dust t={t} area={[260, 600, 560, 900]} opacity={0.6} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 2. « Et toi, tu as ABANDONNÉ. Reprends ta manette. C'est UN ORDRE. » */
/* ------------------------------------------------------------------ */

/** Avant-bras du héros, vus à la première personne. */
const Arm: React.FC<{ from: [number, number]; to: [number, number] }> = ({
  from,
  to,
}) => (
  <g filter="url(#glow)">
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke={palette.hero}
      strokeWidth={74}
      strokeLinecap="round"
    />
    <circle cx={to[0]} cy={to[1]} r={58} fill={palette.hero} />
  </g>
);

export const SceneController: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const grab = pop(t, at("reprends"), 120);
  const order = atPart("ordre", 1);
  const lift = pop(t, order, 200);
  const cx = 540;
  const cy = 1150 - lift * 40;
  const jolt = t > order && t < order + 0.25 ? shake(t, 6, 1) : 0;
  // Mains : pendantes, puis sur les poignées de la manette.
  const restL: [number, number] = [150, 1780];
  const restR: [number, number] = [930, 1790];
  const gripL: [number, number] = [cx - 330, cy + 210];
  const gripR: [number, number] = [cx + 330, cy + 210];
  const handL: [number, number] = [
    mix(restL[0], gripL[0], grab),
    mix(restL[1], gripL[1], grab),
  ];
  const handR: [number, number] = [
    mix(restR[0], gripR[0], grab),
    mix(restR[1], gripR[1], grab),
  ];
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.75 + lift * 0.25} />
      {/* Tapis : ellipses concentriques */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          cx={540}
          cy={1260}
          rx={500 - i * 70}
          ry={250 - i * 35}
          fill="none"
          stroke={palette.lineFaint}
          strokeWidth={4}
          strokeDasharray={i % 2 ? "14 18" : undefined}
        />
      ))}
      <Pool x={540} y={1260} rx={520} ry={240} opacity={0.7} />
      {lift > 0 ? (
        <circle
          cx={cx}
          cy={cy - 80}
          r={420}
          fill="url(#goldHalo)"
          opacity={lift * 0.6}
        />
      ) : null}
      <Controller
        x={cx + jolt}
        y={cy}
        scale={1.05 + lift * 0.08}
        rotate={mix(-9, 0, grab)}
        lit={lift}
      />
      <Arm from={[60, 2050]} to={handL} />
      <Arm from={[1020, 2050]} to={handR} />
      <Dust t={t} area={[200, 600, 680, 800]} opacity={0.5} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 3. « Tes potes aussi ont abandonné. RAPPELLE-LES. »                  */
/* ------------------------------------------------------------------ */

export const SceneMates: React.FC = () => {
  const { t, at } = useSceneTime();
  const call = at("rappelle");
  const raise = pop(t, call - 0.15, 160);
  const turn = progress(t, call + 0.45, 0.35);
  const ground = 1400;
  const heroPose: Pose = blendPose(
    STAND,
    { ...STAND, armR: [150, 172], nod: -8 },
    raise,
  );
  const mates = [520, 690, 860];
  const signal = progress(t, call, 0.9);
  return (
    <Stage>
      <Moon x={170} y={760} r={34} />
      <Sea t={t} horizon={1170} moonX={170} />
      <Beam x={540} bottom={900} opacity={0.7} />
      {/* Ponton : planches en perspective */}
      <polygon
        points={`-100,${ground} 1180,${ground} 1180,1920 -100,1920`}
        fill="#070d22"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const y = ground + i * i * 4 + i * 16;
        return (
          <line
            key={i}
            x1={-100}
            y1={y}
            x2={1180}
            y2={y}
            stroke={palette.lineFaint}
            strokeWidth={2 + i * 0.3}
          />
        );
      })}
      <line
        x1={-100}
        y1={ground}
        x2={1180}
        y2={ground}
        stroke={palette.lineSoft}
        strokeWidth={4}
      />
      {/* Lanternes */}
      {[90, 1000].map((x) => (
        <g key={x}>
          <line
            x1={x}
            y1={ground}
            x2={x}
            y2={ground - 330}
            stroke={palette.line}
            strokeWidth={8}
          />
          <rect
            x={x - 22}
            y={ground - 380}
            width={44}
            height={56}
            rx={8}
            fill={palette.goldLight}
            opacity={0.85}
            filter="url(#glowStrong)"
          />
          <circle
            cx={x}
            cy={ground - 350}
            r={120}
            fill="url(#goldHalo)"
            opacity={0.5}
          />
        </g>
      ))}
      <Pool x={540} y={ground + 10} rx={460} ry={60} />
      <Figure x={230} y={ground - LEG} hero pose={heroPose} />
      {raise > 0.05 ? (
        <Phone
          x={262}
          y={ground - LEG - 186}
          scale={0.45 * raise}
          ring={raise}
          t={t}
          rotate={-10}
        />
      ) : null}
      {/* Onde d'appel qui part vers les potes */}
      {signal > 0 && signal < 1 ? (
        <circle
          cx={262}
          cy={ground - LEG - 186}
          r={60 + signal * 700}
          fill="none"
          stroke={palette.hero}
          strokeWidth={6}
          opacity={(1 - signal) * 0.8}
          filter="url(#glow)"
        />
      ) : null}
      {mates.map((x, i) => {
        const pose: Pose = {
          ...STAND,
          armL: [-4, -2],
          armR: [4, 2],
          nod: mix(28, -6, turn),
          lean: mix(10, 0, turn),
        };
        return (
          <g key={x}>
            <Figure
              x={x}
              y={ground - LEG}
              pose={pose}
              facing={turn > 0.5 ? -1 : 1}
            />
            <Controller
              x={x + 46}
              y={ground - 10}
              scale={0.1}
              rotate={i * 20 - 15}
            />
          </g>
        );
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 4. « Si un seul de vous trouve le jeton, TOUTE L'ÉQUIPE L'A. »      */
/* ------------------------------------------------------------------ */

export const SQUAD = [
  { name: "TOI", hero: true },
  { name: "NAÏM", hero: false },
  { name: "LÉO", hero: false },
  { name: "SACHA", hero: false },
] as const;

export const SQUAD_X = [172, 417, 663, 908];

export const SceneSquad: React.FC = () => {
  const { t, at } = useSceneTime();
  const found = pop(t, at("trouve") + 0.1);
  const share = at("toute") + 0.1;
  const spread = progress(t, share, 0.55);
  const cardY = 1150;
  const tokenY = 870;
  return (
    <Stage>
      <Beam x={SQUAD_X[2]} bottom={420} opacity={1 - spread * 0.4} />
      <Beam x={540} bottom={1000} opacity={spread * 0.8} />
      <line
        x1={60}
        y1={1350}
        x2={1020}
        y2={1350}
        stroke={palette.lineFaint}
        strokeWidth={3}
      />
      <Pool x={540} y={1350} rx={520} ry={50} />
      {SQUAD.map((m, i) => {
        const lit = i === 2 ? 1 : spread;
        return (
          <SquadCard
            key={m.name}
            x={SQUAD_X[i]}
            y={cardY + (i === 2 ? -found * 14 : 0)}
            name={m.name}
            hero={m.hero}
            online={1}
            dim={(1 - lit) * 0.8}
            gold={i === 2 ? found : spread}
          />
        );
      })}
      {/* Le jeton trouvé, puis dupliqué pour toute l'équipe */}
      {SQUAD_X.map((x, i) => {
        if (i === 2) {
          return (
            <Token
              key={i}
              x={x}
              y={tokenY + wave(t, 2) * 6}
              r={62 * found}
              spin={t * 30}
              rays={0.4 * found}
            />
          );
        }
        const p = progress(t, share + Math.abs(i - 2) * 0.08, 0.5);
        if (p <= 0) {
          return null;
        }
        return (
          <Token
            key={i}
            x={mix(SQUAD_X[2], x, p)}
            y={tokenY - Math.sin(p * Math.PI) * 120}
            r={62 * Math.min(1, p * 1.5)}
            spin={t * 30}
            rays={0.4 * p}
          />
        );
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 5. « Il y en a un qui ne répondra pas… INSISTE… peut-être lui »     */
/* ------------------------------------------------------------------ */

export const SceneSleeper: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1380;
  const ring1 = inOut(t, at("repondra"), at("lequel"), 0.1, 0.2);
  const insist = at("insiste");
  const ring2 = inOut(t, insist, at("peutEtre") + 0.2, 0.05, 0.25);
  const ring = Math.max(ring1, ring2);
  const missed =
    t < at("repondra")
      ? 0
      : t < insist
        ? 1
        : Math.min(9, 1 + Math.floor((t - insist) / 0.06));
  const dream = pop(t, at("peutEtre") + 0.2);
  const glowUp = progress(t, at("trouvera"), 0.5);
  const sleeper = { x: 440, y: floor - 132 };
  const head = { x: sleeper.x - 131, y: sleeper.y };
  const phoneX = 860;
  const phoneY = floor - 150;
  return (
    <Stage>
      {/* Hublot du salon */}
      <g transform="translate(830 820)">
        <circle
          r={95}
          fill="#0a1636"
          stroke={palette.line}
          strokeWidth={8}
          filter="url(#glow)"
        />
        <circle cx={20} cy={-20} r={26} fill="#eef3ff" />
        <circle cx={32} cy={-27} r={22} fill="#0a1636" />
      </g>
      <Beam x={430} bottom={820} opacity={0.75} />
      <Floor y={floor} t={t} />
      <Pool x={430} y={floor} rx={420} ry={60} />
      <Sofa x={420} y={floor} w={560} />
      {/* Le dormeur, allongé sur le canapé, casque sur les oreilles */}
      <Figure
        x={sleeper.x}
        y={sleeper.y}
        scale={1.25}
        rotate={-90}
        pose={{
          ...STAND,
          armL: [30, 60],
          armR: [20, 40],
          legL: [-6, -2],
          legR: [4, 2],
          nod: 10,
          lean: 0,
        }}
        color={palette.mate}
      />
      <path
        d={`M${head.x + 6},${head.y - 34} A36,36 0 0 0 ${head.x + 6},${head.y + 34}`}
        fill="none"
        stroke={palette.line}
        strokeWidth={9}
        strokeLinecap="round"
      />
      {/* Zzz */}
      {dream < 0.5
        ? [0, 1, 2].map((i) => {
            const p = (t * 0.5 + i / 3) % 1;
            return (
              <text
                key={i}
                x={head.x + 20 + p * 70}
                y={head.y - 50 - p * 170}
                fontFamily={impactFont}
                fontWeight={900}
                fontSize={36 + p * 26}
                fill={palette.lineSoft}
                opacity={Math.sin(p * Math.PI) * (1 - dream * 2)}
              >
                z
              </text>
            );
          })
        : null}
      {/* Table basse et téléphone */}
      <line
        x1={760}
        y1={floor - 70}
        x2={960}
        y2={floor - 70}
        stroke={palette.line}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <line
        x1={780}
        y1={floor - 70}
        x2={780}
        y2={floor}
        stroke={palette.line}
        strokeWidth={6}
      />
      <line
        x1={940}
        y1={floor - 70}
        x2={940}
        y2={floor}
        stroke={palette.line}
        strokeWidth={6}
      />
      <Phone
        x={phoneX + (ring > 0 ? shake(t, 5 * ring, 2) : 0)}
        y={phoneY}
        scale={0.62}
        ring={ring}
        t={t}
      />
      {missed > 0 ? (
        <Badge
          x={phoneX + 46}
          y={phoneY - 72}
          w={64}
          h={58}
          gold
          scale={0.85 + (ring2 > 0 ? 0.15 : 0)}
        >
          <text
            y={14}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={36}
            fill={palette.goldLight}
          >
            {missed >= 9 ? "9+" : missed}
          </text>
        </Badge>
      ) : null}
      {/* Il rêve du jeton */}
      <ThoughtBubble
        x={460}
        y={880}
        w={220}
        h={150}
        tailX={head.x + 30}
        tailY={head.y - 60}
        opacity={dream}
      >
        <Token
          x={460}
          y={880}
          r={44 * dream}
          spin={t * 40}
          glow={0.6 + glowUp * 0.6}
          rays={glowUp * 0.8}
        />
      </ThoughtBubble>
    </Stage>
  );
};
