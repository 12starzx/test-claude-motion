/**
 * Acte 2 (16,9 → 32,9 s) : trois semaines, en service, jour et nuit,
 * les coffres et les chiffres.
 */
import { random } from "remotion";
import { bodyFont, impactFont } from "../fonts";
import {
  clamp01,
  easeInOut,
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
  Token,
  blendPose,
} from "../components/art/Characters";
import { Beam, Dust, Pool } from "../components/art/Environment";
import {
  Bed,
  Blanket,
  Chest,
  Desk,
  Hourglass,
  Monitor,
  Porthole,
  ThoughtBubble,
} from "../components/art/Props";
import { Floor } from "./common";

/* ------------------------------------------------------------------ */
/* 6. « Le problème, c'est qu'il vous reste TROIS SEMAINES. »          */
/* ------------------------------------------------------------------ */

export const SceneWeeks: React.FC = () => {
  const { t, at } = useSceneTime();
  const reveal = at("troisSemaines");
  const level = 1 - progress(t, 0, 2.2, (v) => v) * 0.2;
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <Stage>
      <Beam x={540} bottom={700} opacity={0.85} />
      <Pool x={540} y={1340} rx={360} ry={50} />
      <Hourglass
        x={540}
        y={1060}
        h={460}
        level={level}
        t={t}
        rotate={wave(t, 3) * 1.5}
      />
      {/* Trois semaines de sept jours */}
      {[0, 1, 2].map((row) =>
        days.map((d, col) => {
          const index = row * 7 + col;
          const p = pop(t, reveal + index * 0.012, 240);
          const x = 540 + (col - 3) * 112;
          const y = 1430 + row * 96;
          return (
            <g
              key={index}
              transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * p})`}
              opacity={0.35 + 0.65 * p}
            >
              <rect
                x={-40}
                y={-36}
                width={80}
                height={72}
                rx={14}
                fill={palette.ink}
                stroke={p > 0.5 ? palette.goldLight : palette.lineSoft}
                strokeWidth={5}
                filter={p > 0.5 ? "url(#glow)" : undefined}
              />
              <text
                y={12}
                textAnchor="middle"
                fontFamily={impactFont}
                fontWeight={800}
                fontSize={32}
                fill={p > 0.5 ? palette.goldLight : palette.lineSoft}
              >
                {d}
              </text>
            </g>
          );
        }),
      )}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 7. « Tu ne joues plus. Tu es EN SERVICE. »                           */
/* ------------------------------------------------------------------ */

export const SceneService: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1400;
  const crossed = progress(t, at("joues") + 0.35, 0.35);
  const duty = at("service") + 0.45;
  const on = pop(t, duty, 200);
  const sweep = (t - duty) * 260;
  const heroPose = blendPose(
    STAND,
    { ...STAND, armR: [150, 200], nod: -6 },
    on,
  );
  return (
    <Stage>
      <Beam x={300} bottom={560} opacity={0.8} />
      <Floor y={floor} t={t} />
      <Pool x={300} y={floor} rx={260} ry={46} />
      <Figure x={300} y={floor - LEG} hero pose={heroPose} scale={1.1} />
      {/* Poste de jeu barré */}
      <Desk x={740} y={floor} w={300} h={170} />
      <Monitor
        x={740}
        y={floor - 170}
        w={230}
        h={150}
        label="JEU"
        crossed={crossed}
        glow={0.5}
      />
      {/* Gyrophare de service */}
      <g transform={`translate(740 ${floor - 380})`} opacity={on}>
        {on > 0.05
          ? [0, 180].map((offset) => (
              <polygon
                key={offset}
                points="0,0 520,-90 520,90"
                fill="rgba(255, 190, 90, 0.5)"
                transform={`rotate(${sweep + offset})`}
                filter="url(#soft)"
                style={{ mixBlendMode: "screen" }}
              />
            ))
          : null}
        <rect
          x={-46}
          y={-6}
          width={92}
          height={22}
          rx={6}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={5}
        />
        <path
          d="M-34,-6 C-34,-70 34,-70 34,-6 Z"
          fill={palette.gold}
          stroke={palette.goldLight}
          strokeWidth={4}
          filter="url(#glowStrong)"
        />
      </g>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 8. « Tu te couches… Tu te lèves en pensant au jeton. »              */
/* ------------------------------------------------------------------ */

export const SceneBed: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1440;
  const think = pop(t, at("pensant1"));
  const morning = progress(t, at("leves"), 0.7, easeInOut);
  const sitUp = pop(t, at("leves") + 0.15, 140);
  const think2 = progress(t, at("pensant2"), 0.4);
  const bedX = 560;
  return (
    <Stage>
      <Porthole x={250} y={850} r={100} night={1 - morning} />
      <Beam x={560} bottom={760} opacity={0.75 + morning * 0.2} />
      <Floor y={floor} t={t} />
      <Pool x={560} y={floor} rx={420} ry={60} />
      {/* Étagère : coffre miniature et trophée */}
      <line
        x1={780}
        y1={880}
        x2={1000}
        y2={880}
        stroke={palette.line}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <Chest x={840} y={876} w={80} />
      <rect
        x={926}
        y={830}
        width={34}
        height={46}
        rx={6}
        fill="none"
        stroke={palette.lineSoft}
        strokeWidth={4}
      />
      <Bed x={bedX} y={floor} w={520} facing={-1} />
      {/* Le héros : allongé, puis assis */}
      {sitUp < 0.5 ? (
        <Figure
          x={bedX + 110}
          y={floor - 128}
          rotate={90}
          hero
          pose={{ ...STAND, armL: [10, 20], armR: [10, 20] }}
          scale={1.05}
          opacity={1 - sitUp * 2}
        />
      ) : (
        <Figure
          x={bedX + 170}
          y={floor - 118}
          hero
          pose={{ ...SIT, armL: [-20, -10], armR: [30, 60], nod: -10 }}
          facing={-1}
          opacity={sitUp * 2 - 1}
        />
      )}
      <Blanket
        x={bedX + 10}
        y={floor - 108}
        w={320}
        facing={1}
        breathe={wave(t, 2.6)}
      />
      <ThoughtBubble
        x={bedX + 10}
        y={1000 - think2 * 20}
        w={230}
        h={150}
        tailX={bedX + 150}
        tailY={floor - 230}
        opacity={think}
      >
        <Token
          x={bedX + 10}
          y={1000 - think2 * 20}
          r={44 * think}
          spin={t * 40}
          glow={0.7}
          rays={0.4 + think2 * 0.4}
        />
      </ThoughtBubble>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 9. « Entre les deux, tu ouvres des coffres. »                       */
/* ------------------------------------------------------------------ */

export const SceneConveyor: React.FC = () => {
  const { t } = useSceneTime();
  const belt = 1330;
  const speed = 320;
  const gap = 270;
  const chests = Array.from({ length: 7 }, (_, i) => {
    const x = ((1400 + i * gap - t * speed) % (gap * 7)) - 200;
    return { x, i };
  });
  return (
    <Stage>
      <Beam x={540} bottom={620} opacity={0.9} />
      {/* Le héros, derrière le tapis roulant */}
      <Figure
        x={540}
        y={belt - 150}
        hero
        pose={{
          ...STAND,
          armL: [40, 90 + wave(t, 0.5) * 30],
          armR: [-40, -90 - wave(t, 0.5) * 30],
          nod: 18,
        }}
        scale={1.4}
      />
      {chests.map(({ x, i }) => {
        const near = 1 - clamp01(Math.abs(x - 540) / 200);
        const opened = x < 540 ? 1 : near;
        return (
          <Chest
            key={i}
            x={x}
            y={belt - 6}
            w={190}
            open={opened}
            opacity={0.5 + 0.5 * (1 - clamp01(Math.abs(x - 540) / 600))}
          />
        );
      })}
      {/* Tapis roulant */}
      <rect
        x={-60}
        y={belt}
        width={1200}
        height={44}
        rx={22}
        fill={palette.ink}
        stroke={palette.line}
        strokeWidth={6}
        filter="url(#glow)"
      />
      {Array.from({ length: 16 }, (_, i) => {
        const x = ((((i * 80 - t * speed) % 1280) + 1280) % 1280) - 100;
        return (
          <circle
            key={i}
            cx={x}
            cy={belt + 22}
            r={9}
            fill="none"
            stroke={palette.lineSoft}
            strokeWidth={3}
          />
        );
      })}
      <Floor y={belt + 140} t={t} />
      {[200, 880].map((x) => (
        <line
          key={x}
          x1={x}
          y1={belt + 44}
          x2={x}
          y2={belt + 140}
          stroke={palette.line}
          strokeWidth={8}
        />
      ))}
      <Dust t={t} area={[280, 600, 520, 700]} opacity={0.5} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 10. « 137 500 COFFRES. Ça fait 6 500 PAR JOUR. »                     */
/* ------------------------------------------------------------------ */

const MiniChest: React.FC<{
  x: number;
  y: number;
  s: number;
  gold?: boolean;
  opacity: number;
}> = ({ x, y, s, gold = false, opacity }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path
      d="M-16,8 L-16,-4 C-16,-14 16,-14 16,-4 L16,8 Z M-16,-2 L16,-2"
      fill={gold ? "rgba(255,162,43,0.35)" : palette.ink}
      stroke={gold ? palette.goldLight : palette.lineSoft}
      strokeWidth={2.4}
      strokeLinejoin="round"
    />
  </g>
);

export const SceneTotal: React.FC = () => {
  const { t, at } = useSceneTime();
  const cols = 20;
  const rows = 20;
  const cell = 48;
  const x0 = 540 - ((cols - 1) * cell) / 2;
  const y0 = 720;
  const zoom = mix(1.9, 1, progress(t, 0, 1.4, easeInOut));
  const perDay = at("parJour");
  const highlight = progress(t, perDay, 0.3);
  // 6 500 / 137 500 ≈ 4,7 % : une colonne entière (20 coffres sur 400).
  const goldCol = 13;
  return (
    <Stage>
      <Beam x={540} bottom={1200} opacity={0.6} />
      <g transform={`translate(540 1180) scale(${zoom}) translate(-540 -1180)`}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const d = Math.hypot(c - cols / 2, r - rows / 2) / 14;
            const appear = clamp01((t - d * 0.9) / 0.25);
            const isGold = c === goldCol;
            const jitter = random(`mc-${r}-${c}`) * 0.3;
            return (
              <MiniChest
                key={`${r}-${c}`}
                x={x0 + c * cell}
                y={y0 + r * cell}
                s={appear * 1.05}
                gold={isGold && highlight > 0}
                opacity={appear * (isGold ? 1 : 1 - highlight * (0.6 + jitter))}
              />
            );
          }),
        )}
        {highlight > 0 ? (
          <rect
            x={x0 + goldCol * cell - cell / 2}
            y={y0 - cell / 2}
            width={cell}
            height={rows * cell}
            rx={10}
            fill="none"
            stroke={palette.goldLight}
            strokeWidth={4}
            opacity={highlight}
            filter="url(#glow)"
          />
        ) : null}
      </g>
      <Figure x={540} y={1700 - LEG * 0.4} scale={0.4} hero />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 11. « Tu en ouvres 40, parfois 50. FAIS MIEUX. »                     */
/* ------------------------------------------------------------------ */

export const SceneGauge: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1480;
  const goal = 6500;
  const fill40 = progress(t, at("quarante") + 0.3, 0.5);
  const fill50 = progress(t, at("cinquante") + 0.3, 0.4);
  const count = Math.round(mix(0, 40, fill40) + mix(0, 10, fill50));
  const push = at("faisMieux");
  const alarm = t > push ? Math.max(0, 1 - (t - push) / 0.9) : 0;
  const jolt = alarm > 0 ? shake(t, 10 * alarm, 3) : 0;
  const barW = 860;
  const barX = 540 - barW / 2;
  const barY = 1050;
  // Proportion réelle (50 / 6 500 ≈ 0,8 %) : un filet à peine visible, c'est le propos.
  const filled = Math.max(16, (count / goal) * barW);
  const heroPose = blendPose(
    STAND,
    { ...STAND, armR: [140, 150], armL: [-20, -40], nod: -18 },
    pop(t, push, 180),
  );
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.75} />
      <Floor y={floor} t={t} />
      <Pool x={540} y={floor} rx={300} ry={50} />
      <g transform={`translate(${jolt} 0)`}>
        <text
          x={barX}
          y={barY - 70}
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={110}
          fill={palette.goldLight}
          filter="url(#glow)"
        >
          {count}
        </text>
        <text
          x={barX + barW}
          y={barY - 70}
          textAnchor="end"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={48}
          fill={palette.lineSoft}
        >
          / 6 500
        </text>
        <rect
          x={barX}
          y={barY - 34}
          width={barW}
          height={68}
          rx={34}
          fill={palette.ink}
          stroke={alarm > 0 ? "#ff6b5a" : palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        <rect
          x={barX + 8}
          y={barY - 26}
          width={Math.min(filled, barW - 16)}
          height={52}
          rx={26}
          fill={palette.gold}
          filter="url(#glow)"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={i}
            x1={barX + (i + 1) * (barW / 10)}
            y1={barY + 46}
            x2={barX + (i + 1) * (barW / 10)}
            y2={barY + 62}
            stroke={palette.lineFaint}
            strokeWidth={4}
          />
        ))}
      </g>
      <Figure x={540} y={floor - LEG} hero pose={heroPose} scale={1.1} />
      <Chest x={680} y={floor} w={120} open={0.4} />
      <Chest x={790} y={floor} w={100} open={0.6} />
    </Stage>
  );
};
