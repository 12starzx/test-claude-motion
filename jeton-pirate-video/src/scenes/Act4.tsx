/**
 * Acte 4 (53,4 → 71 s) : le dernier soir, le coffre au bord de l'eau,
 * le jeton pour toute l'équipe.
 */
import { impactFont } from "../fonts";
import { easeInOut, mix, pop, progress, wave } from "../lib/anim";
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
  Stars,
} from "../components/art/Environment";
import {
  CalendarCard,
  Chest,
  Clock,
  Signpost,
  SquadCard,
} from "../components/art/Props";
import { Badge, Beach } from "./common";
import { SQUAD, SQUAD_X } from "./Act1";

/* ------------------------------------------------------------------ */
/* 18. « Le 4 décembre. 23 heures. »                                    */
/* ------------------------------------------------------------------ */

export const SceneClock: React.FC = () => {
  const { t, at } = useSceneTime();
  const spin = progress(t, 0.1, 1.3, easeInOut);
  // De 20 h 00 à 23 h 00 : l'aiguille des heures passe de 240° à 330°.
  const hour = mix(240, 330, spin);
  const minute = mix(0, 3 * 360, spin);
  const digital = pop(t, at("heures"), 200);
  const card = pop(t, 0.1);
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.8} />
      <Pool x={540} y={1500} rx={420} ry={60} />
      <Clock x={540} y={1010} r={220} hour={hour} minute={minute} />
      <CalendarCard
        x={290}
        y={1430}
        day={4}
        w={210}
        opacity={card}
        rotate={-4}
      />
      <Badge
        x={790}
        y={1430}
        w={300}
        h={140}
        gold
        scale={digital}
        opacity={digital}
      >
        <text
          y={34}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={92}
          fill={palette.goldLight}
        >
          23:00
        </text>
      </Badge>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 19. « Toute l'équipe est connectée. Même celui qui ne répondait pas. » */
/* ------------------------------------------------------------------ */

export const SceneOnline: React.FC = () => {
  const { t, at } = useSceneTime();
  const cardY = 1120;
  const wake = at("repondait") + 0.3;
  const links = progress(t, at("connectee"), 0.6);
  const last = progress(t, wake, 0.4);
  return (
    <Stage>
      <Stars
        t={t}
        count={30}
        area={[0, 650, 1080, 300]}
        seed="online"
        opacity={0.6}
      />
      <Beam x={540} bottom={1050} opacity={0.6 + last * 0.3} />
      <line
        x1={60}
        y1={1330}
        x2={1020}
        y2={1330}
        stroke={palette.lineFaint}
        strokeWidth={3}
      />
      <Pool x={540} y={1330} rx={520} ry={50} />
      {/* Liens réseau entre les joueurs connectés */}
      {[0, 1, 2].map((i) => {
        const active = i < 2 ? links : last;
        const x1 = SQUAD_X[i];
        const x2 = mix(SQUAD_X[i], SQUAD_X[i + 1], active);
        return (
          <line
            key={i}
            x1={x1}
            y1={cardY - 200}
            x2={x2}
            y2={cardY - 200}
            stroke={palette.hero}
            strokeWidth={5}
            strokeDasharray="12 10"
            strokeDashoffset={-t * 60}
            opacity={active}
            filter="url(#glow)"
          />
        );
      })}
      {SQUAD.map((m, i) => {
        const online =
          i < 3 ? progress(t, at("connectee") + i * 0.18, 0.15) : last;
        return (
          <g key={m.name}>
            <SquadCard
              x={SQUAD_X[i]}
              y={cardY - (i === 3 ? pop(t, wake) * 16 : 0)}
              name={m.name}
              hero={m.hero}
              online={online}
              dim={i === 3 ? 1 - last : 0}
              asleep={i === 3 && last < 0.5}
              t={t}
            />
            <circle
              cx={SQUAD_X[i]}
              cy={cardY - 200}
              r={10}
              fill={online > 0.5 ? palette.hero : "#5b6585"}
              filter="url(#glow)"
            />
          </g>
        );
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 20. « Un coffre brille au bord de l'eau. Tu l'ouvres. »              */
/* ------------------------------------------------------------------ */

export const SceneShore: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1470;
  const stop = at("ouvres") - 0.1;
  const walkT = Math.min(t, stop);
  const heroX = mix(
    150,
    540,
    progress(walkT, 0, stop, (v) => v),
  );
  const walking = t < stop;
  const reach = pop(t, stop, 160);
  const heroPose: Pose = walking
    ? walkPose(t * 1.6)
    : blendPose(
        STAND,
        { ...STAND, armR: [110, 120], nod: 16, lean: 14 },
        reach,
      );
  const crack = progress(t, at("ouvres") + 0.15, 0.6);
  const pulse = 0.45 + 0.2 * wave(t, 1.1);
  return (
    <Stage>
      <Moon x={860} y={740} r={40} />
      <Sea t={t} horizon={1230} moonX={860} />
      <Beach y={ground - 6} t={t} tilt={10} />
      {/* L'écume au bord de l'eau */}
      <path
        d={`M600,${ground - 24 + wave(t, 2) * 4} C700,${ground - 40} 860,${ground - 30} 1180,${ground - 44}`}
        fill="none"
        stroke={palette.line}
        strokeWidth={4}
        opacity={0.5}
        strokeDasharray="20 14"
        strokeDashoffset={t * 30}
      />
      <Pool
        x={720}
        y={ground}
        rx={280}
        ry={50}
        gold
        opacity={pulse + crack * 0.4}
      />
      <Chest
        x={720}
        y={ground}
        w={230}
        open={crack * 0.35}
        light={pulse + crack * 0.5}
      />
      {/* L'équipe suit le héros */}
      {[1, 2, 3].map((k) => (
        <Figure
          key={k}
          x={heroX - 120 * k}
          y={ground - LEG * (1 - k * 0.06)}
          scale={1 - k * 0.06}
          pose={walking ? walkPose(t * 1.6 + k * 0.27) : STAND}
          opacity={0.9 - k * 0.1}
        />
      ))}
      <Figure x={heroX} y={ground - LEG} hero pose={heroPose} />
      <Dust
        t={t}
        area={[520, 900, 400, 500]}
        color={palette.goldLight}
        opacity={0.6}
      />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 21. « LE JETON EST LÀ. Pour toute l'équipe. »                        */
/* ------------------------------------------------------------------ */

export const SceneReveal: React.FC = () => {
  const { t, at } = useSceneTime();
  const rise = progress(t, 0.05, 1.1, easeInOut);
  const all = pop(t, at("pourToute"));
  const tokenY = mix(1450, 1060, rise) + wave(t, 2.2) * 8;
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.5} />
      <circle
        cx={540}
        cy={1200}
        r={700}
        fill="url(#goldHalo)"
        opacity={0.55 + rise * 0.3}
      />
      <Chest x={540} y={1760} w={660} open={1} light={1} />
      <Burst
        x={540}
        y={1430}
        elapsed={t - 0.05}
        count={140}
        spread={420}
        rise={420}
        duration={1.8}
        seed="reveal"
      />
      <Token x={540} y={tokenY} r={170} spin={t * 18} rays={0.9} glow={1} />
      {/* Quatre éclats qui partent vers l'équipe */}
      {[-1, -0.35, 0.35, 1].map((k, i) => (
        <circle
          key={i}
          cx={540 + k * 380 * all}
          cy={tokenY + 260 * all}
          r={18 * all}
          fill={palette.goldLight}
          opacity={all * (1 - progress(t, at("pourToute") + 0.5, 0.4))}
          filter="url(#glowStrong)"
        />
      ))}
      <Dust
        t={t}
        area={[200, 700, 680, 900]}
        color={palette.goldLight}
        opacity={0.8}
        count={60}
      />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 22. « Le 5 décembre, le jeton disparaît… »                           */
/* ------------------------------------------------------------------ */

export const SceneFinalDay: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1450;
  const threat = at("disparaitFin");
  // Le jeton vacille… mais tient.
  const flicker =
    t > threat && t < threat + 0.9
      ? 0.55 + 0.45 * Math.abs(Math.sin((t - threat) * 22))
      : 1;
  const team: Pose = { ...STAND, nod: -14 };
  return (
    <Stage>
      <Moon x={860} y={720} r={38} />
      <Sea t={t} horizon={1240} moonX={860} />
      <Beam x={540} bottom={780} opacity={0.9} />
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
      <Beach y={ground - 20} t={t} />
      <Pool x={540} y={ground} rx={420} ry={60} gold opacity={0.7} />
      <Signpost x={540} y={ground} h={170}>
        <CalendarCard x={0} y={-60} day={5} w={240} highlight />
      </Signpost>
      {[300, 400, 680, 780].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={ground - LEG * 0.85}
          scale={0.85}
          hero={i === 1}
          pose={team}
          facing={x < 540 ? 1 : -1}
        />
      ))}
      <Burst
        x={540}
        y={930}
        elapsed={t - threat}
        count={90}
        spread={260}
        rise={160}
        duration={1.2}
        seed="threat"
      />
      <Token
        x={540}
        y={930 + wave(t, 2.4) * 10}
        r={125}
        spin={t * 12}
        rays={0.9 * flicker}
        glow={flicker}
        opacity={flicker}
      />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 23. « …sauf pour ceux qui n'ont pas ABANDONNÉ. »                     */
/* ------------------------------------------------------------------ */

export const SceneFinale: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1480;
  const xs = [250, 430, 650, 830];
  const cheer = pop(t, atPart("pasAbandonne", 1), 150);
  return (
    <Stage>
      <Moon x={860} y={720} r={38} />
      <Sea t={t} horizon={1250} moonX={860} />
      <Beam x={540} bottom={1100} opacity={0.9} />
      <Beach y={ground - 6} t={t} />
      <Pool
        x={540}
        y={ground}
        rx={480}
        ry={64}
        gold
        opacity={0.6 + cheer * 0.3}
      />
      {xs.map((x, i) => {
        const appear = pop(t, i * 0.14 + 0.05);
        const pose: Pose = blendPose(
          { ...STAND, nod: -12 },
          i === 1
            ? { ...STAND, armR: [165, 175], armL: [-150, -170], nod: -16 }
            : { ...STAND, armR: [140, 160], nod: -14 },
          cheer,
        );
        return (
          <g key={x}>
            <Token
              x={x}
              y={980 + wave(t, 2, i * 0.4) * 10}
              r={74 * appear}
              spin={t * 20 + i * 20}
              rays={0.5 * appear}
            />
            <Figure x={x} y={ground - LEG} hero={i === 1} pose={pose} />
          </g>
        );
      })}
      <Dust
        t={t}
        area={[120, 700, 840, 700]}
        color={palette.goldLight}
        opacity={0.8}
        count={70}
      />
    </Stage>
  );
};
