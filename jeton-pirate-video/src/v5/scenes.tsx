/**
 * Scènes de la vidéo 5 (« le blocus ») : dimanche soir, la chambre, le
 * blocus pour le jeton, lundi matin.
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
import { Beam, Burst, Dust, Pool } from "../components/art/Environment";
import {
  Bed,
  Blanket,
  CalendarCard,
  Chair,
  Chest,
  Clock,
  Controller,
  Desk,
  Monitor,
  Porthole,
  SquadCard,
} from "../components/art/Props";
import { SQUAD, SQUAD_X } from "../scenes/Act1";
import { Floor } from "../scenes/common";
import { GameScreen, Locker } from "../v2/props";

/** Croix rouge. */
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

/** Pancarte de porte « BLOCUS » (style « ne pas déranger »). */
const DoorHanger: React.FC<{
  x: number;
  y: number;
  s?: number;
  lit?: number;
  swing?: number;
}> = ({ x, y, s = 1, lit = 0, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
    <rect
      x={-80}
      y={0}
      width={160}
      height={260}
      rx={22}
      fill={palette.ink}
      stroke={lit > 0.5 ? palette.goldLight : palette.line}
      strokeWidth={6}
      filter="url(#glow)"
    />
    <circle
      cx={0}
      cy={50}
      r={28}
      fill={palette.night}
      stroke={palette.line}
      strokeWidth={5}
    />
    <text
      y={150}
      textAnchor="middle"
      fontFamily={impactFont}
      fontWeight={900}
      fontSize={36}
      fill={lit > 0.5 ? palette.goldLight : palette.line}
      transform="rotate(-90 0 150)"
    >
      BLOCUS
    </text>
    {lit > 0 ? (
      <rect
        x={-80}
        y={0}
        width={160}
        height={260}
        rx={22}
        fill="url(#goldHalo)"
        opacity={lit * 0.6}
      />
    ) : null}
  </g>
);

/* 2. « Et t'as toujours pas eu LE JETON PIRATE. » (lundi matin, au réveil) */
export const V5Scroll: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const floor = 1460;
  const miss = progress(t, atPart("toujoursPas", 1), 0.4);
  const scroll = (t * 140) % 120;
  return (
    <Stage>
      <Porthole x={250} y={860} r={95} night={0} />
      <Beam x={620} bottom={700} opacity={0.5} />
      <Floor y={floor} t={t} />
      <Bed x={600} y={floor} w={520} facing={-1} />
      <Figure
        x={700}
        y={floor - 128}
        rotate={90}
        hero
        pose={{ ...STAND, armL: [150, 170], armR: [150, 170] }}
        scale={1.05}
      />
      <Blanket
        x={590}
        y={floor - 108}
        w={300}
        facing={1}
        breathe={wave(t, 2.6)}
      />
      {/* Téléphone tenu au-dessus du visage, écran qui défile */}
      <g transform="translate(790 1170)">
        <circle r={150} fill="url(#poolFill)" opacity={0.9} />
        <rect
          x={-60}
          y={-110}
          width={120}
          height={220}
          rx={18}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={5}
          filter="url(#glow)"
        />
        <g opacity={1 - miss}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={-44}
              y={-92 + ((i * 60 + scroll) % 180)}
              width={88}
              height={44}
              rx={6}
              fill="#c9d6ff"
              opacity={0.35}
            />
          ))}
        </g>
        {miss > 0 ? (
          <g opacity={miss}>
            <Token x={0} y={-10} r={36} glow={0.2} rays={0} opacity={0.45} />
            <Cross x={0} y={-10} s={0.7} p={miss} />
          </g>
        ) : null}
      </g>
      <text
        x={250}
        y={1030}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={800}
        fontSize={44}
        fill={palette.lineSoft}
        opacity={pop(t, 0.1)}
      >
        7:02
      </text>
    </Stage>
  );
};

/* 1. « C'est lundi. T'AS COURS. » --------------------------------------- */
export const V5Monday: React.FC = () => {
  const { t, at } = useSceneTime();
  const ring = at("cours");
  const jolt = t > ring && t < ring + 0.6 ? shake(t, 8, 3) : 0;
  return (
    <Stage>
      <Beam x={540} bottom={800} opacity={0.6} />
      <Floor y={1460} t={t} />
      <g transform={`translate(${330 + jolt} 1080)`}>
        <Clock x={0} y={0} r={160} hour={210} minute={0} />
        <text
          y={230}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={800}
          fontSize={40}
          fill={palette.line}
        >
          RÉVEIL 7:00
        </text>
      </g>
      <CalendarCard
        x={760}
        y={1000}
        day="16"
        month="LUNDI"
        w={260}
        opacity={pop(t, 0.1)}
        rotate={4}
      />
      {/* Cartable */}
      <g transform={`translate(760 1420) scale(${pop(t, ring)})`}>
        <rect
          x={-110}
          y={-150}
          width={220}
          height={150}
          rx={30}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        <path
          d="M-50,-150 C-50,-200 50,-200 50,-150"
          fill="none"
          stroke={palette.line}
          strokeWidth={8}
        />
        <rect
          x={-60}
          y={-90}
          width={120}
          height={50}
          rx={10}
          fill="none"
          stroke={palette.lineSoft}
          strokeWidth={4}
        />
      </g>
    </Stage>
  );
};

/* 3. « Alors écoute-moi bien : ce soir, tu fais UN BLOCUS. » ------------ */
export const V5Blocus: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const slam = atPart("blocus", 1);
  const lit = progress(t, slam, 0.3);
  const swing =
    t > slam ? Math.sin((t - slam) * 9) * 14 * Math.exp(-(t - slam) * 2.5) : 0;
  return (
    <Stage>
      <Beam x={540} bottom={800} opacity={0.5 + lit * 0.4} />
      <Floor y={1500} t={t} />
      {/* Porte de la chambre */}
      <rect
        x={360}
        y={760}
        width={360}
        height={740}
        rx={12}
        fill={palette.ink}
        stroke={palette.line}
        strokeWidth={6}
        filter="url(#glow)"
      />
      <rect
        x={390}
        y={800}
        width={300}
        height={300}
        rx={8}
        fill="none"
        stroke={palette.lineFaint}
        strokeWidth={4}
      />
      <rect
        x={390}
        y={1140}
        width={300}
        height={320}
        rx={8}
        fill="none"
        stroke={palette.lineFaint}
        strokeWidth={4}
      />
      <circle cx={660} cy={1150} r={16} fill={palette.line} />
      <line
        x1={660}
        y1={1150}
        x2={660}
        y2={1170}
        stroke={palette.line}
        strokeWidth={4}
      />
      <DoorHanger
        x={660}
        y={1160}
        s={0.8 * pop(t, 0.2)}
        lit={lit}
        swing={swing}
      />
      <Burst
        x={660}
        y={1260}
        elapsed={t - slam}
        count={50}
        spread={200}
        rise={160}
        duration={1}
        seed="blocus"
      />
    </Stage>
  );
};

/* 4. « Pas pour les maths. POUR LE JETON. » ----------------------------- */
export const V5Maths: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1480;
  const away = progress(t, 0.5, 0.5);
  const forToken = pop(t, at("pourJeton"));
  return (
    <Stage>
      <Beam x={560} bottom={800} opacity={0.6 + forToken * 0.3} />
      <Floor y={floor} t={t} />
      <Desk x={560} y={floor} w={520} h={170} />
      <Chair x={250} y={floor} />
      {/* Cahier de maths qui glisse hors du bureau */}
      <g
        transform={`translate(${mix(470, 120, away)} ${floor - 190}) rotate(${-away * 30})`}
        opacity={1 - away * 0.8}
      >
        <rect
          x={-110}
          y={-30}
          width={220}
          height={60}
          rx={8}
          fill={palette.inkLight}
          stroke={palette.line}
          strokeWidth={4}
        />
        <text
          y={12}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={30}
          fill={palette.line}
        >
          MATHS
        </text>
        <Cross x={0} y={0} s={0.6} p={away} />
      </g>
      <Controller x={640} y={floor - 230} scale={0.32} lit={forToken} />
      {forToken > 0 ? (
        <Token
          x={640}
          y={1000 + wave(t, 2) * 8}
          r={90 * forToken}
          spin={t * 20}
          rays={0.6 * forToken}
        />
      ) : null}
    </Stage>
  );
};

/* 5. « Le 5 décembre, il disparaît. Il reste MOINS DE 3 SEMAINES. » ----- */
export const V5Deadline: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const fade = progress(t, atPart("dec5", 1), 0.6);
  const grid = atPart("semaines", 1);
  // Du lundi 16 novembre au samedi 5 décembre : 20 jours.
  const days = 20;
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.7} />
      <Floor y={1560} t={t} />
      <g transform="translate(540 870)">
        <CalendarCard x={0} y={0} day={5} w={240} highlight />
        <Token
          x={0}
          y={-220}
          r={60}
          spin={t * 20}
          rays={0.3 * (1 - fade)}
          glow={1 - fade}
          opacity={1 - fade * 0.85}
        />
      </g>
      {Array.from({ length: days }, (_, i) => {
        const p = pop(t, grid + i * 0.03, 220);
        const col = i % 7;
        const row = Math.floor(i / 7);
        return (
          <g
            key={i}
            transform={`translate(${540 + (col - 3) * 112} ${1220 + row * 100}) scale(${0.6 + 0.4 * p})`}
            opacity={p}
          >
            <rect
              x={-42}
              y={-38}
              width={84}
              height={76}
              rx={14}
              fill={palette.ink}
              stroke={i === days - 1 ? palette.goldLight : palette.lineSoft}
              strokeWidth={4}
            />
            <text
              y={12}
              textAnchor="middle"
              fontFamily={bodyFont}
              fontWeight={600}
              fontSize={30}
              fill={palette.line}
            >
              {((15 + i) % 30) + 1}
            </text>
          </g>
        );
      })}
    </Stage>
  );
};

/* 6. « Chaque soir où tu lâches, UNE CHANCE EN MOINS. » ------------------ */
export const V5Chance: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1450;
  const start = at("chance");
  const xs = [140, 340, 540, 740, 940];
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.6} />
      <Floor y={floor} t={t} />
      {xs.map((x, i) => {
        const gone = progress(t, start + i * 0.18, 0.3);
        return (
          <g key={x} opacity={1 - gone * 0.85}>
            <Chest
              x={x}
              y={floor - gone * 30}
              w={150}
              light={0.4 * (1 - gone)}
            />
            {gone > 0 ? <Cross x={x} y={floor - 80} s={0.6} p={gone} /> : null}
          </g>
        );
      })}
    </Stage>
  );
};

/* 7. « Oui, demain tu seras fatigué. Oui, ton prof va te regarder bizarrement. » */
export const V5Class: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1470;
  const look = pop(t, at("prof"));
  const yawn = 0.5 + 0.5 * Math.sin(t * 2);
  return (
    <Stage>
      <Beam x={700} bottom={700} opacity={0.5} />
      <Floor y={floor} t={t} />
      {/* Tableau */}
      <rect
        x={560}
        y={780}
        width={460}
        height={300}
        rx={14}
        fill="#0f2a2a"
        stroke={palette.line}
        strokeWidth={6}
      />
      <text
        x={790}
        y={950}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={46}
        fill={palette.lineSoft}
      >
        x² + 2x = ?
      </text>
      {/* Le prof qui le fixe */}
      <Figure
        x={820}
        y={floor - LEG}
        facing={-1}
        pose={{ ...STAND, armR: [60, 90], nod: -4 }}
        color={palette.mate}
      />
      {look > 0 ? (
        <text
          x={760}
          y={1150}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={70}
          fill={palette.goldLight}
          opacity={look}
        >
          ?!
        </text>
      ) : null}
      {/* Le héros affalé sur sa table */}
      <Chair x={230} y={floor} />
      <Desk x={380} y={floor} w={220} h={120} />
      <Figure
        x={250}
        y={floor - 72}
        hero
        pose={{
          ...SIT,
          armL: [70, 100],
          armR: [80, 110],
          nod: 50 + yawn * 10,
          lean: 30,
        }}
      />
      {[0, 1, 2].map((i) => {
        const p = (t * 0.6 + i / 3) % 1;
        return (
          <text
            key={i}
            x={300 + p * 60}
            y={1200 - p * 150}
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={34 + p * 20}
            fill={palette.lineSoft}
            opacity={Math.sin(p * Math.PI)}
          >
            z
          </text>
        );
      })}
    </Stage>
  );
};

/* 8. « Dans 10 ans, personne ne se souviendra DE CE MARDI. » (le jeton, lui, reste au casier) */
export const V5Locker: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const floor = 1500;
  const years = progress(t, 0.1, 1.2, (v) => v);
  const year = Math.min(2036, 2026 + Math.floor(years * 10.999));
  const forget = progress(t, at("personne") + 0.4, 1.2);
  const open = progress(t, atPart("personne", 1), 0.4);
  return (
    <Stage>
      <Beam x={760} bottom={600} opacity={0.6 + open * 0.3} />
      <Floor y={floor} t={t} />
      <text
        x={300}
        y={880}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={110}
        fill={year === 2036 ? palette.goldLight : palette.line}
      >
        {year}
      </text>
      <g
        opacity={1 - forget}
        transform={`translate(300 1180) rotate(${-forget * 25}) scale(${1 - forget * 0.3})`}
      >
        <CalendarCard x={0} y={0} day="17" month="MARDI" w={230} />
      </g>
      {forget > 0 && forget < 1 ? (
        <Dust
          t={t}
          area={[200, 1080, 200, 200]}
          count={20}
          opacity={1 - forget}
        />
      ) : null}
      <Locker x={760} y={floor} w={240} h={500} name="TOI" hero open={open}>
        <Token x={0} y={-270} r={74} spin={t * 20} rays={0.6} glow={1} />
      </Locker>
    </Stage>
  );
};

/* 9. « RÉVEILLE TON ÉQUIPE. ALLUME LA CONSOLE. OUVRE CHAQUE COFFRE. » ---- */
export const V5Call: React.FC = () => {
  const { t, at } = useSceneTime();
  const wake = (i: number) => progress(t, i * 0.15, 0.2);
  const consoleOn = pop(t, at("console"));
  const chest = progress(t, at("coffre") + 0.1, 0.5);
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.7} />
      <Floor y={1560} t={t} />
      {SQUAD.map((m, i) => (
        <SquadCard
          key={m.name}
          x={SQUAD_X[i]}
          y={850}
          w={150}
          name={m.name}
          hero={m.hero}
          online={wake(i)}
          dim={(1 - wake(i)) * 0.7}
          t={t}
        />
      ))}
      <g
        transform={`translate(330 1290) scale(${consoleOn})`}
        opacity={consoleOn}
      >
        <Monitor x={0} y={110} w={260} h={170} glow={0.8} label="ON" />
      </g>
      <g opacity={pop(t, at("coffre"))}>
        <Chest x={790} y={1460} w={260} open={chest} light={chest} />
        <Burst
          x={790}
          y={1300}
          elapsed={t - at("coffre") - 0.2}
          count={60}
          spread={200}
          rise={200}
          duration={1}
          seed="v5chest"
        />
      </g>
    </Stage>
  );
};

/* 10. « Ce soir, ce n'est pas une partie. C'EST UN BLOCUS. » ------------ */
export const V5NotGame: React.FC = () => {
  const { t, at } = useSceneTime();
  const crossed = progress(t, 0.5, 0.5);
  const sign = pop(t, at("cestBlocus"));
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.6 + sign * 0.3} />
      <Floor y={1560} t={t} />
      <g transform="translate(540 1000) scale(0.8)" opacity={1 - sign * 0.7}>
        <GameScreen x={0} y={0} crossed={crossed} mission={0} />
      </g>
      {sign > 0 ? (
        <g transform={`translate(540 1330) scale(${sign})`}>
          <rect
            x={-330}
            y={-90}
            width={660}
            height={180}
            rx={30}
            fill={palette.ink}
            stroke={palette.goldLight}
            strokeWidth={8}
            filter="url(#glowStrong)"
          />
          <text
            y={36}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={110}
            letterSpacing={10}
            fill={palette.gold}
            filter="url(#glow)"
          >
            BLOCUS
          </text>
        </g>
      ) : null}
    </Stage>
  );
};

/* 11. « Et demain, tu vas en cours quand même. Mais peut-être… AVEC LE JETON. » */
export const V5Morning: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const floor = 1480;
  const withToken = pop(t, atPart("avecJeton", 1));
  const heroX = mix(220, 640, progress(t, 0, 4, easeInOut));
  return (
    <Stage>
      <Porthole x={860} y={840} r={100} night={1 - progress(t, 0, 1.2)} />
      <Beam x={heroX} bottom={500} opacity={0.6 + withToken * 0.3} />
      <Floor y={floor} t={t} />
      <Pool
        x={heroX}
        y={floor}
        rx={160}
        ry={36}
        gold={withToken > 0.3}
        opacity={0.4 + withToken * 0.5}
      />
      <Figure
        x={heroX}
        y={floor - LEG}
        hero
        pose={
          withToken > 0.5
            ? blendPose(
                walkPose(t * 1.5, 20),
                { ...STAND, armR: [150, 170] },
                withToken,
              )
            : walkPose(t * 1.5, 22)
        }
      />
      {/* Cartable sur le dos */}
      <rect
        x={heroX - 48}
        y={floor - LEG - 70}
        width={34}
        height={56}
        rx={10}
        fill={palette.ink}
        stroke={palette.line}
        strokeWidth={4}
      />
      {withToken > 0 ? (
        <Token
          x={heroX + 40}
          y={1060 + wave(t, 2) * 8}
          r={80 * withToken}
          spin={t * 20}
          rays={0.8 * withToken}
        />
      ) : null}
      <Burst
        x={heroX + 40}
        y={1060}
        elapsed={t - atPart("avecJeton", 1)}
        count={70}
        spread={220}
        rise={200}
        duration={1.2}
        seed="morning"
      />
    </Stage>
  );
};
