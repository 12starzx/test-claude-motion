/**
 * Scènes de la vidéo 4 (« GTA 6 : treize ans »).
 */
import { bodyFont, impactFont } from "../fonts";
import {
  easeInOut,
  easeOut,
  mix,
  pop,
  progress,
  shake,
  wave,
} from "../lib/anim";
import { Stage, useSceneTime } from "../lib/scene";
import { palette } from "../theme";
import {
  Figure,
  LEG,
  SIT,
  STAND,
  blendPose,
  walkPose,
} from "../components/art/Characters";
import { Burst, Dust } from "../components/art/Environment";
import {
  CalendarCard,
  Clock,
  Hourglass,
  Phone,
  ThoughtBubble,
} from "../components/art/Props";
import {
  Car,
  GameBox,
  Palm,
  RetroTV,
  RoadSign,
  Skyline,
  Stamp,
  ViewCounter,
  neon,
} from "./props";

/** Sol sombre au premier plan (devant le soleil couchant). */
const Ground: React.FC<{ y?: number }> = ({ y = 1584 }) => (
  <g>
    <rect
      x={-100}
      y={y}
      width={1280}
      height={1920 - y}
      fill={neon.silhouette}
      opacity={0.92}
    />
    <line
      x1={-100}
      y1={y}
      x2={1180}
      y2={y}
      stroke={neon.pink}
      strokeWidth={3}
      opacity={0.6}
      filter="url(#glow)"
    />
  </g>
);

/** Canapé simple, en silhouette. */
const Couch: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      x={-170}
      y={-150}
      width={340}
      height={90}
      rx={26}
      fill={neon.silhouette}
      stroke={palette.lineSoft}
      strokeWidth={4}
    />
    <rect
      x={-190}
      y={-80}
      width={380}
      height={70}
      rx={20}
      fill={neon.silhouette}
      stroke={palette.lineSoft}
      strokeWidth={4}
    />
    <line
      x1={-160}
      y1={-10}
      x2={-160}
      y2={0}
      stroke={palette.line}
      strokeWidth={6}
    />
    <line
      x1={160}
      y1={-10}
      x2={160}
      y2={0}
      stroke={palette.line}
      strokeWidth={6}
    />
  </g>
);

/* 1. « Le 17 septembre 2013, GTA 5 SORT. » ----------------------------- */
export const V4Release: React.FC = () => {
  const { t, at } = useSceneTime();
  const box = pop(t, at("gta5"));
  return (
    <Stage>
      <Palm x={110} y={1600} h={560} sway={wave(t, 4) * 8} />
      <Palm x={990} y={1610} h={500} flip sway={wave(t, 4.4) * 8} />
      <Ground />
      <g transform={`translate(540 980) scale(${pop(t, 0.05)})`}>
        <CalendarCard x={0} y={0} day={17} month="SEPT. 2013" w={300} />
      </g>
      {box > 0 ? (
        <GameBox
          x={540}
          y={1330}
          s={box}
          title="GTA 5"
          rotate={wave(t, 3) * 3}
        />
      ) : null}
      <Burst
        x={540}
        y={1330}
        elapsed={t - at("gta5")}
        count={60}
        spread={260}
        rise={200}
        duration={1}
        seed="gta5"
        color={neon.sun}
      />
    </Stage>
  );
};

/* 2. « Tu te dis : le prochain, ce sera dans 3 ou 4 ans. » ------------- */
export const V4Guess: React.FC = () => {
  const { t, at } = useSceneTime();
  const bubble = pop(t, at("prochain"));
  return (
    <Stage>
      <Ground />
      <RetroTV x={760} y={1270} s={0.62}>
        <text
          x={-20}
          y={20}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={64}
          fill={neon.sun}
        >
          GTA 5
        </text>
      </RetroTV>
      <Couch x={330} y={1584} />
      <Figure
        x={330}
        y={1440}
        hero
        pose={{ ...SIT, armL: [30, 80], armR: [40, 90], nod: -6 }}
      />
      <ThoughtBubble
        x={420}
        y={950}
        w={320}
        h={170}
        tailX={340}
        tailY={1290}
        opacity={bubble}
      >
        <text
          x={420}
          y={978}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={76}
          fill="#fff"
        >
          2017 ?
        </text>
      </ThoughtBubble>
    </Stage>
  );
};

/* 3. « 13 ans plus tard… TU ATTENDS TOUJOURS. » ------------------------- */
export const V4Years: React.FC = () => {
  const { t, at } = useSceneTime();
  const p = progress(t, 0.1, at("attends") - 0.1, (v) => v);
  const year = Math.min(2026, 2013 + Math.floor(p * 13.999));
  const webs = progress(t, at("attends"), 0.6);
  return (
    <Stage>
      <Ground />
      <Couch x={330} y={1584} />
      <Figure
        x={330}
        y={1440}
        hero
        pose={{ ...SIT, armL: [20, 40], armR: [24, 40], nod: 26, lean: 16 }}
      />
      {/* Toiles d'araignée */}
      <g opacity={webs} stroke={palette.lineSoft} strokeWidth={2} fill="none">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M140,1300 Q${200 + i * 12},${1300 + i * 20} ${180 + i * 30},${1360 + i * 10}`}
          />
        ))}
        <path d="M140,1300 L260,1300 M140,1300 L140,1420 M140,1300 L230,1390" />
      </g>
      <g transform="translate(760 1020)">
        <rect
          x={-210}
          y={-110}
          width={420}
          height={220}
          rx={30}
          fill={neon.silhouette}
          stroke={palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        <text
          y={40}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={130}
          fill={year === 2026 ? neon.sun : "#fff"}
        >
          {year}
        </text>
      </g>
      <Clock x={760} y={1400} r={110} hour={t * 900} minute={t * 9000} />
    </Stage>
  );
};

/* 4. « Décembre 2023 : PREMIER TRAILER. 90 MILLIONS de vues en 24 heures. » */
export const V4Trailer1: React.FC = () => {
  const { t, at } = useSceneTime();
  const play = pop(t, at("trailer1"));
  const count = mix(0, 90_000_000, progress(t, at("vues90"), 1.6, easeOut));
  return (
    <Stage>
      <Palm x={90} y={1600} h={520} sway={wave(t, 4) * 8} />
      <Ground />
      <RetroTV x={540} y={1080} s={1.05}>
        <circle
          cx={-20}
          cy={0}
          r={80 * play}
          fill={neon.pink}
          opacity={0.9}
          filter="url(#glow)"
        />
        <path
          d="M-50,-40 L20,0 L-50,40 Z"
          fill="#fff"
          transform={`translate(10 0) scale(${play})`}
        />
        <text
          x={-20}
          y={-120}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={30}
          fill={palette.lineSoft}
        >
          DÉC. 2023
        </text>
      </RetroTV>
      {t > at("vues90") ? (
        <ViewCounter
          x={540}
          y={1460}
          value={count}
          label="vues en 24 heures"
          size={88}
        />
      ) : null}
    </Stage>
  );
};

/* 5. « Tout le monde y croit : sortie en 2025. » ------------------------- */
export const V4Hype: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const sign = pop(t, atPart("sortie2025", 1));
  const xs = [150, 280, 410, 670, 800, 930];
  return (
    <Stage>
      <Ground />
      {xs.map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={1584 - LEG}
          pose={{
            ...STAND,
            armR: [150 + wave(t, 0.6, i) * 12, 170],
            armL: [-150 - wave(t, 0.7, i) * 12, -170],
          }}
          opacity={0.85}
          scale={0.95}
        />
      ))}
      <Figure
        x={540}
        y={1584 - LEG}
        hero
        pose={{ ...STAND, armR: [165, 175], armL: [-165, -175] }}
      />
      <g
        transform={`translate(540 1060) scale(${sign}) rotate(${wave(t, 1.2) * 3})`}
      >
        <line
          x1={0}
          y1={60}
          x2={0}
          y2={380}
          stroke={palette.line}
          strokeWidth={10}
        />
        <rect
          x={-190}
          y={-80}
          width={380}
          height={160}
          rx={18}
          fill="#fff"
          stroke={neon.pink}
          strokeWidth={8}
          filter="url(#glow)"
        />
        <text
          y={44}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={120}
          fill={neon.dusk}
        >
          2025
        </text>
      </g>
    </Stage>
  );
};

/* 6. « Puis premier report : MAI 2026. Puis deuxième report : NOVEMBRE. » */
export const V4Delays: React.FC = () => {
  const { t, at } = useSceneTime();
  const s1 = progress(t, 0.25, 0.25);
  const c2 = pop(t, at("mai2026"));
  const s2 = progress(t, at("report2") + 0.25, 0.25);
  const c3 = pop(t, at("novembre"));
  const jolt = (k: number) => (t > k && t < k + 0.3 ? shake(t, 6, k * 10) : 0);
  return (
    <Stage>
      <Ground />
      <g
        transform={`translate(${250 + jolt(0.25)} 900) rotate(-6)`}
        opacity={1 - c3 * 0.4}
      >
        <CalendarCard x={0} y={0} day="2025" month="SORTIE" w={260} />
        <Stamp x={0} y={0} p={s1} />
      </g>
      {c2 > 0 ? (
        <g
          transform={`translate(${790 + jolt(at("report2") + 0.25)} 1050) scale(${c2}) rotate(5)`}
          opacity={1 - c3 * 0.4}
        >
          <CalendarCard x={0} y={0} day="26" month="MAI 2026" w={260} />
          <Stamp x={0} y={0} p={s2} />
        </g>
      ) : null}
      {c3 > 0 ? (
        <g transform={`translate(540 1330) scale(${c3})`}>
          <circle r={260} fill="url(#goldHalo)" opacity={0.8} />
          <CalendarCard
            x={0}
            y={0}
            day="19"
            month="NOV. 2026"
            w={300}
            highlight
          />
        </g>
      ) : null}
    </Stage>
  );
};

/* 7. « Rockstar préfère attendre plutôt que sortir un jeu pas fini. » --- */
export const V4Polish: React.FC = () => {
  const { t } = useSceneTime();
  const p = mix(0.62, 0.99, progress(t, 0.2, 2.6, easeInOut));
  const barW = 760;
  return (
    <Stage>
      <Ground />
      <g transform="translate(540 1050)">
        <text
          y={-110}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={54}
          letterSpacing={6}
          fill="#fff"
        >
          FINITION
        </text>
        <rect
          x={-barW / 2}
          y={-40}
          width={barW}
          height={80}
          rx={40}
          fill={neon.silhouette}
          stroke={palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        <rect
          x={-barW / 2 + 10}
          y={-30}
          width={(barW - 20) * p}
          height={60}
          rx={30}
          fill={neon.pink}
          filter="url(#glow)"
        />
        <text
          y={140}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={96}
          fill={neon.sun}
        >
          {Math.floor(p * 100)} %
        </text>
      </g>
      {/* Engrenages */}
      {[
        [260, 1420, 70, 1],
        [380, 1460, 46, -1.5],
      ].map(([gx, gy, r, dir]) => (
        <g
          key={gx}
          transform={`translate(${gx} ${gy}) rotate(${t * 60 * dir})`}
        >
          <circle
            r={r}
            fill="none"
            stroke={palette.line}
            strokeWidth={10}
            strokeDasharray="14 10"
          />
          <circle
            r={r * 0.4}
            fill={neon.silhouette}
            stroke={palette.line}
            strokeWidth={6}
          />
        </g>
      ))}
      <Figure
        x={800}
        y={1584 - LEG}
        hero
        pose={{ ...STAND, armR: [80, 20], armL: [-20, -10], nod: 8 }}
      />
    </Stage>
  );
};

/* 8. « DEUX REPORTS. 13 ANS. ZÉRO RACCOURCI. » ------------------------- */
export const V4Statement: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const a = pop(t, 0.05);
  const b = pop(t, at("treizeAns"));
  const c = pop(t, atPart("zero", 1));
  return (
    <Stage>
      <Ground />
      <g transform={`translate(260 1050) scale(${a})`}>
        <Stamp x={0} y={-40} p={1} text="×2" color={neon.pink} />
      </g>
      <g transform={`translate(780 1020) scale(${b})`}>
        <text
          textAnchor="middle"
          y={60}
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={220}
          fill="#fff"
          filter="url(#glow)"
        >
          13
        </text>
      </g>
      <g transform={`translate(540 1380) scale(${c})`}>
        {/* Raccourci barré */}
        <path
          d="M-200,40 C-100,40 -60,-80 120,-80"
          fill="none"
          stroke={palette.line}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d="M100,-110 L150,-80 L100,-50"
          fill="none"
          stroke={palette.line}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={-220}
          y1={-120}
          x2={200}
          y2={80}
          stroke="#ff4f5e"
          strokeWidth={16}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </g>
    </Stage>
  );
};

/* 9. « Mai 2025 : DEUXIÈME TRAILER. 475 MILLIONS de vues en un jour. » --- */
export const V4Trailer2: React.FC = () => {
  const { t, at } = useSceneTime();
  const count = mix(0, 475_000_000, progress(t, at("vues475"), 1.8, easeOut));
  const screens = pop(t, at("trailer2"));
  return (
    <Stage>
      <Ground />
      {/* Globe filaire */}
      <g transform={`translate(540 1020) scale(${pop(t, 0.05)})`}>
        <circle
          r={230}
          fill="rgba(20,10,44,0.6)"
          stroke={palette.line}
          strokeWidth={5}
          filter="url(#glow)"
        />
        {[-150, -75, 0, 75, 150].map((y) => (
          <ellipse
            key={y}
            cx={0}
            cy={y}
            rx={Math.sqrt(230 * 230 - y * y)}
            ry={14}
            fill="none"
            stroke={palette.lineFaint}
            strokeWidth={3}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            rx={Math.abs(Math.cos(t * 0.8 + i)) * 230}
            ry={230}
            fill="none"
            stroke={palette.lineSoft}
            strokeWidth={3}
          />
        ))}
      </g>
      {/* Écrans tout autour du globe */}
      {[
        [170, 800],
        [910, 820],
        [150, 1240],
        [930, 1250],
      ].map(([sx, sy], i) => (
        <g
          key={i}
          transform={`translate(${sx} ${sy}) scale(${screens})`}
          opacity={screens}
        >
          <rect
            x={-90}
            y={-60}
            width={180}
            height={120}
            rx={12}
            fill={neon.silhouette}
            stroke={i % 2 ? neon.pink : neon.cyan}
            strokeWidth={5}
            filter="url(#glow)"
          />
          <path d="M-14,-22 L22,0 L-14,22 Z" fill="#fff" />
        </g>
      ))}
      {t > at("vues475") ? (
        <ViewCounter
          x={540}
          y={1450}
          value={count}
          label="vues en un jour"
          size={84}
        />
      ) : null}
    </Stage>
  );
};

/* 10. « Le monde entier regarde VICE CITY. » --------------------------- */
export const V4ViceCity: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const lit = progress(t, atPart("monde", 1), 0.5);
  return (
    <Stage>
      <Skyline y={1584} t={t} lit={0.4 + lit * 0.6} />
      <Palm x={90} y={1640} h={640} sway={wave(t, 4) * 10} />
      <Palm x={1000} y={1650} h={600} flip sway={wave(t, 4.6) * 10} />
      <Ground y={1640} />
      {[260, 380, 500, 620, 740, 860].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={1700 - LEG * 0.8}
          scale={0.8}
          hero={i === 2}
          pose={{ ...STAND, nod: -18 }}
          opacity={0.9}
        />
      ))}
      <text
        x={540}
        y={900}
        textAnchor="middle"
        fontFamily={impactFont}
        fontWeight={900}
        fontSize={110}
        fill="none"
        stroke={neon.pink}
        strokeWidth={4}
        opacity={lit}
        filter="url(#glowStrong)"
        letterSpacing={8}
      >
        VICE CITY
      </text>
    </Stage>
  );
};

/* 11. « Et toi, pendant ces 13 ans, tu as attendu… OU TU AS AVANCÉ ? » --- */
export const V4Choice: React.FC = () => {
  const { t, at } = useSceneTime();
  const climb = progress(t, at("avance"), 1.1, (v) => v);
  const steps = 6;
  const stepIdx = Math.min(steps - 1, Math.floor(climb * steps));
  const sx = 640 + stepIdx * 60;
  const sy = 1584 - stepIdx * 60;
  const dimLeft = progress(t, at("attendu"), 0.4);
  return (
    <Stage>
      <Ground />
      <line
        x1={540}
        y1={700}
        x2={540}
        y2={1584}
        stroke={palette.lineFaint}
        strokeWidth={3}
        strokeDasharray="12 14"
      />
      {/* Gauche : il attend */}
      <g opacity={1 - dimLeft * 0.5}>
        <Couch x={290} y={1584} />
        <Figure
          x={290}
          y={1440}
          pose={{ ...SIT, nod: 26 }}
          color={palette.mate}
        />
        <text
          x={290}
          y={1700}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={34}
          fill={palette.lineSoft}
        >
          attendre
        </text>
      </g>
      {/* Droite : il avance */}
      {Array.from({ length: steps }, (_, i) => (
        <rect
          key={i}
          x={610 + i * 60}
          y={1584 - (i + 1) * 60}
          width={60}
          height={(i + 1) * 60}
          fill={neon.silhouette}
          stroke={i <= stepIdx && climb > 0 ? neon.sun : palette.lineSoft}
          strokeWidth={4}
        />
      ))}
      <Figure
        x={sx}
        y={sy - 60 - LEG}
        hero
        pose={climb > 0 && climb < 1 ? walkPose(t * 2, 26) : STAND}
      />
      <text
        x={790}
        y={1700}
        textAnchor="middle"
        fontFamily={bodyFont}
        fontWeight={600}
        fontSize={34}
        fill={climb > 0 ? neon.sun : palette.lineSoft}
      >
        avancer
      </text>
    </Stage>
  );
};

/* 12. « La vraie leçon : ce qui est grand PREND DU TEMPS… PAR ARRIVER. » */
export const V4Build: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const floors = 12;
  const built = Math.floor(
    progress(t, 0.2, atPart("arriver", 1) - 0.6, (v) => v) * floors,
  );
  const top = 1584 - built * 62;
  const arrive = pop(t, atPart("arriver", 1));
  return (
    <Stage>
      <Ground />
      {/* Grue */}
      <g stroke={palette.line} strokeWidth={6} fill="none">
        <line x1={820} y1={1584} x2={820} y2={760} />
        <line x1={600} y1={780} x2={960} y2={780} />
        <line x1={820} y1={760} x2={660} y2={780} />
        <line
          x1={660}
          y1={780}
          x2={660}
          y2={840 + wave(t, 1.5) * 20}
          strokeWidth={3}
        />
      </g>
      {Array.from({ length: built }, (_, i) => (
        <g key={i}>
          <rect
            x={380}
            y={1584 - (i + 1) * 62}
            width={280}
            height={62}
            fill={neon.silhouette}
            stroke={palette.line}
            strokeWidth={4}
          />
          {[0, 1, 2, 3].map((w) => (
            <rect
              key={w}
              x={400 + w * 66}
              y={1584 - (i + 1) * 62 + 18}
              width={36}
              height={26}
              fill={neon.sun}
              opacity={0.6}
            />
          ))}
        </g>
      ))}
      {arrive > 0 ? (
        <>
          <Figure
            x={520}
            y={top - LEG}
            hero
            pose={blendPose(
              STAND,
              { ...STAND, armR: [165, 175], armL: [-150, -170] },
              arrive,
            )}
          />
          <line
            x1={600}
            y1={top}
            x2={600}
            y2={top - 160}
            stroke={palette.line}
            strokeWidth={6}
          />
          <path
            d={`M600,${top - 160} L690,${top - 135} L600,${top - 110} Z`}
            fill={neon.pink}
            filter="url(#glow)"
          />
        </>
      ) : null}
      <Burst
        x={560}
        y={top - 120}
        elapsed={t - atPart("arriver", 1)}
        count={70}
        spread={260}
        rise={220}
        duration={1.2}
        seed="arrive"
        color={neon.sun}
      />
    </Stage>
  );
};

/* 13. « JEUDI 19 NOVEMBRE. Leonida OUVRE SES PORTES. Jason et Lucia sont prêts. » */
export const V4Leonida: React.FC = () => {
  const { t, at } = useSceneTime();
  const cal = pop(t, 0.05);
  const sign = pop(t, at("leonida"));
  const duo = pop(t, at("jason"));
  const fadeCal = progress(t, at("leonida") - 0.2, 0.4);
  return (
    <Stage>
      <Palm x={80} y={1600} h={560} sway={wave(t, 4) * 8} />
      <Palm x={1000} y={1610} h={540} flip sway={wave(t, 4.4) * 8} />
      <Ground />
      {/* Route qui part vers l'horizon */}
      <path d="M380,1920 L520,1584 L560,1584 L700,1920 Z" fill="#1d0f30" />
      <path
        d="M540,1600 L540,1920"
        stroke={neon.sun}
        strokeWidth={6}
        strokeDasharray="30 30"
        strokeDashoffset={-t * 120}
      />
      <g transform={`translate(540 1000) scale(${cal})`} opacity={1 - fadeCal}>
        <circle r={260} fill="url(#goldHalo)" opacity={0.7} />
        <CalendarCard
          x={0}
          y={0}
          day="19"
          month="JEU. NOV."
          w={320}
          highlight
        />
      </g>
      {sign > 0 ? (
        <RoadSign x={540} y={1000} text="LEONIDA" sub="Bienvenue" s={sign} />
      ) : null}
      {duo > 0 ? (
        <g opacity={duo}>
          <Car x={790} y={1584} s={0.7} />
          <Figure
            x={300}
            y={1584 - LEG}
            hero
            pose={{ ...STAND, armL: [-20, -10], nod: -6 }}
            facing={1}
          />
          <Figure
            x={380}
            y={1584 - LEG * 0.95}
            scale={0.95}
            color={neon.pink}
            pose={{ ...STAND, armR: [20, 60], nod: -6 }}
            facing={-1}
          />
        </g>
      ) : null}
    </Stage>
  );
};

/* 14. « 13 ANS D'ATTENTE. Plus que QUELQUES JOURS. » -------------------- */
export const V4Countdown: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const last = atPart("jours", 1);
  const glow = progress(t, last, 0.4);
  return (
    <Stage>
      <Palm x={110} y={1600} h={600} sway={wave(t, 4) * 8} />
      <Palm x={990} y={1610} h={560} flip sway={wave(t, 4.4) * 8} />
      <Ground />
      <Hourglass
        x={540}
        y={1150}
        h={460}
        level={mix(
          0.12,
          0.02,
          progress(t, 0, 3, (v) => v),
        )}
        t={t}
      />
      <circle
        cx={540}
        cy={1150}
        r={420}
        fill="url(#goldHalo)"
        opacity={glow * 0.6}
      />
      <Phone x={850} y={1380} scale={0.6} ring={glow} t={t} rotate={8} />
      <Dust
        t={t}
        area={[200, 800, 680, 700]}
        color={neon.sun}
        opacity={0.4 + glow * 0.5}
      />
      <Burst
        x={540}
        y={1150}
        elapsed={t - last}
        count={90}
        spread={320}
        rise={260}
        duration={1.4}
        seed="days"
        color={neon.sun}
      />
    </Stage>
  );
};
