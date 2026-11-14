/**
 * Acte 3 (32,9 → 53,4 s) : la vraie vie qui s'en mêle, les jours qui filent,
 * les coffres vides, l'équipe qui tient.
 */
import { random } from "remotion";
import { bodyFont, impactFont } from "../fonts";
import {
  easeIn,
  easeOut,
  inOut,
  mix,
  pop,
  progress,
  shake,
  wave,
} from "../lib/anim";
import { Stage, useSceneTime } from "../lib/scene";
import { palette } from "../theme";
import { Figure, LEG, SIT, STAND, Token } from "../components/art/Characters";
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
  BookStack,
  CalendarCard,
  Chair,
  Chest,
  Desk,
  Monitor,
  OpenBook,
  Plate,
  SpeechBubble,
} from "../components/art/Props";
import { Badge, Beach, Floor } from "./common";

/** Le héros assis à son bureau (profil, tourné vers la droite). */
const AtDesk: React.FC<{
  x: number;
  floor: number;
  t: number;
  screen?: boolean;
  reading?: boolean;
}> = ({ x, floor, t, screen = true, reading = false }) => {
  const typing = wave(t, 0.25) * 6;
  const pose: Pose = reading
    ? { ...SIT, armL: [40, 120], armR: [50, 125], nod: 22 }
    : { ...SIT, armL: [35, 95 + typing], armR: [40, 100 - typing] };
  return (
    <g>
      <Chair x={x - 30} y={floor} />
      <Figure x={x - 20} y={floor - 72 - LEG * 0.05} pose={pose} hero />
      <Desk x={x + 150} y={floor} w={210} h={120} />
      {screen ? (
        <Monitor x={x + 175} y={floor - 120} w={130} h={92} glow={0.6} />
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 12. « Ta mère t'appelle pour manger. Tu as 4 MINUTES. »              */
/* ------------------------------------------------------------------ */

export const SceneDinner: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1440;
  const call = pop(t, at("mere"), 200);
  const plate = pop(t, at("manger"));
  const timerStart = at("minutes") + 0.3;
  const timer = pop(t, timerStart, 200);
  const remaining = Math.max(
    0,
    240 - Math.floor(Math.max(0, t - timerStart) * 1),
  );
  const label = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  const ringing = t > at("mere") && t < at("mere") + 0.6 ? shake(t, 4, 5) : 0;
  return (
    <Stage>
      <Beam x={360} bottom={600} opacity={0.75} />
      <Floor y={floor} t={t} />
      <Pool x={380} y={floor} rx={320} ry={50} />
      <AtDesk x={300} floor={floor} t={t} />
      {/* L'appel vient de la cuisine, hors champ à droite */}
      <rect
        x={1010}
        y={700}
        width={90}
        height={floor - 700}
        fill={palette.goldLight}
        opacity={0.08 * call}
        filter="url(#soft)"
      />
      <SpeechBubble
        x={760 + ringing}
        y={900}
        w={400}
        h={250}
        tailX={900}
        tailY={1050}
        opacity={call}
      >
        <text
          x={760 + ringing}
          y={850}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={54}
          fill={palette.line}
        >
          À TABLE !
        </text>
        <Plate x={760} y={975} t={t} scale={0.9 * plate} />
      </SpeechBubble>
      {/* Minuteur */}
      <Badge
        x={780}
        y={1240}
        w={280}
        h={130}
        gold
        scale={timer}
        opacity={timer}
      >
        <text
          y={30}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={84}
          fill={palette.goldLight}
        >
          {label}
        </text>
      </Badge>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 13. « Ton prof annonce un contrôle le 4… RAISONS DE SERVICE. »      */
/* ------------------------------------------------------------------ */

export const ScenePlanner: React.FC = () => {
  const { t, at } = useSceneTime();
  const enter = pop(t, 0, 140);
  const note = pop(t, at("controle") + 0.3);
  const move = progress(t, at("decaler") + 0.2, 0.7, easeOut);
  const stamp = progress(t, at("raisons") + 0.1, 0.18, easeIn);
  const w = 860;
  const h = 640;
  const px = 540;
  const py = 1130;
  const cols = 7;
  const cw = (w - 60) / cols;
  const cellPos = (day: number) => {
    const i = day - 1;
    return {
      x: px - w / 2 + 30 + (i % cols) * cw + cw / 2,
      y: py - h / 2 + 190 + Math.floor(i / cols) * 190,
    };
  };
  const from = cellPos(4);
  const to = cellPos(11);
  const nx = mix(from.x, to.x, move);
  const ny = mix(from.y, to.y, move) - Math.sin(move * Math.PI) * 120;
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.6} />
      <g transform={`translate(0 ${(1 - enter) * 120})`} opacity={enter}>
        {/* Page d'agenda */}
        <rect
          x={px - w / 2}
          y={py - h / 2}
          width={w}
          height={h}
          rx={30}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <circle
            key={i}
            cx={px - w / 2 + 80 + i * 88}
            cy={py - h / 2}
            r={12}
            fill={palette.night}
            stroke={palette.line}
            strokeWidth={5}
          />
        ))}
        <text
          x={px}
          y={py - h / 2 + 90}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={52}
          letterSpacing={6}
          fill={palette.line}
        >
          DÉCEMBRE
        </text>
        {Array.from({ length: 14 }, (_, i) => {
          const c = cellPos(i + 1);
          const isToken = i + 1 === 5;
          return (
            <g key={i}>
              <rect
                x={c.x - cw / 2 + 6}
                y={c.y - 70}
                width={cw - 12}
                height={160}
                rx={14}
                fill="none"
                stroke={isToken ? palette.goldLight : palette.lineFaint}
                strokeWidth={isToken ? 5 : 3}
              />
              <text
                x={c.x - cw / 2 + 20}
                y={c.y - 30}
                fontFamily={bodyFont}
                fontWeight={600}
                fontSize={30}
                fill={palette.lineSoft}
              >
                {i + 1}
              </text>
              {isToken ? (
                <Token x={c.x} y={c.y + 30} r={30} glow={0.5} spin={t * 20} />
              ) : null}
            </g>
          );
        })}
        {/* Post-it « CONTRÔLE », décalé au 11 */}
        <g
          transform={`translate(${nx} ${ny + 20}) rotate(${mix(-6, 8, move)}) scale(${note})`}
        >
          <rect
            x={-62}
            y={-58}
            width={124}
            height={116}
            rx={6}
            fill="#f5f1d8"
          />
          <text
            y={-8}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={20}
            fill="#1a2140"
          >
            CONTRÔLE
          </text>
          <text
            y={42}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={46}
            fill="#1a2140"
          >
            {move < 0.5 ? 4 : 11}
          </text>
        </g>
        {/* Tampon « SERVICE » */}
        {stamp > 0 ? (
          <g
            transform={`translate(560 1180) rotate(-12) scale(${mix(2.2, 1, stamp)})`}
            opacity={stamp}
          >
            <rect
              x={-280}
              y={-70}
              width={560}
              height={140}
              rx={18}
              fill="none"
              stroke={palette.gold}
              strokeWidth={10}
              filter="url(#glow)"
            />
            <text
              y={34}
              textAnchor="middle"
              fontFamily={impactFont}
              fontWeight={900}
              fontSize={96}
              letterSpacing={8}
              fill={palette.gold}
            >
              SERVICE
            </text>
          </g>
        ) : null}
      </g>
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 14. « Bien sûr, tu peux aussi réviser. Mais le bac… Le jeton, NON. » */
/* ------------------------------------------------------------------ */

export const SceneExam: React.FC = () => {
  const { t, at } = useSceneTime();
  const floor = 1480;
  const loopIn = inOut(t, at("bac"), at("non") + 0.1, 0.3, 0.25);
  const loopAngle = (t - at("bac")) * 220;
  const years = ["2026", "2027", "2028", "2029"];
  const yearIndex = Math.min(
    years.length - 1,
    Math.max(0, Math.floor((t - at("chaqueAnnee")) / 0.32)),
  );
  const crack = at("non") + 0.5;
  const tokenIn = pop(t, at("non") + 0.05);
  const dissolve = progress(t, crack, 0.35);
  const flip = progress(t, at("reviser") + 0.3, 0.5);
  return (
    <Stage>
      <Beam x={360} bottom={600} opacity={0.75} />
      <Beam x={560} y={-80} bottom={700} opacity={loopIn * 0.6} />
      <Floor y={floor} t={t} />
      <Pool x={380} y={floor} rx={320} ry={50} />
      <AtDesk x={300} floor={floor} t={t} screen={false} reading />
      <OpenBook x={470} y={floor - 124} w={170} flip={flip} />
      <BookStack x={700} y={floor - 120} count={5} w={120} />
      {/* Le bac revient chaque année : une boucle */}
      <g transform="translate(560 930)" opacity={loopIn}>
        <circle
          r={170}
          fill="none"
          stroke={palette.lineSoft}
          strokeWidth={6}
          strokeDasharray="30 22"
          transform={`rotate(${loopAngle})`}
        />
        <g transform={`rotate(${loopAngle})`}>
          <polygon points="170,-30 196,8 144,8" fill={palette.line} />
        </g>
        <rect
          x={-110}
          y={-62}
          width={220}
          height={124}
          rx={26}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={6}
          filter="url(#glow)"
        />
        <text
          y={-4}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={900}
          fontSize={60}
          fill={palette.line}
        >
          BAC
        </text>
        <text
          y={44}
          textAnchor="middle"
          fontFamily={bodyFont}
          fontWeight={600}
          fontSize={34}
          fill={palette.lineSoft}
        >
          {years[yearIndex]}
        </text>
      </g>
      {/* Le jeton, lui, ne revient pas */}
      <Token
        x={560}
        y={930}
        r={110 * tokenIn}
        spin={t * 20}
        glow={1 - dissolve}
        rays={(1 - dissolve) * 0.6}
        opacity={1 - dissolve}
      />
      <Burst
        x={560}
        y={930}
        elapsed={t - crack}
        count={120}
        spread={320}
        rise={240}
        duration={1.2}
        seed="non"
      />
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 15. « Le problème, c'est que les jours partent plus vite… »         */
/* ------------------------------------------------------------------ */

export const SceneDays: React.FC = () => {
  const { t, duration } = useSceneTime();
  const first = 8;
  const last = 23;
  // Les feuillets s'arrachent de plus en plus vite.
  const k = (v: number) => v ** 1.6;
  const current = Math.min(
    last,
    first + Math.floor(k(Math.min(1, t / (duration - 0.3))) * (last - first)),
  );
  const torn = Array.from({ length: current - first }, (_, i) => first + i);
  return (
    <Stage>
      <Moon x={180} y={760} r={34} />
      <Sea t={t} horizon={1250} moonX={180} />
      {/* Lignes de vent */}
      {Array.from({ length: 7 }, (_, i) => {
        const y = 820 + i * 70;
        const x =
          ((((900 - t * (500 + i * 60) + i * 170) % 1300) + 1300) % 1300) - 150;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + 140}
            y2={y}
            stroke={palette.lineFaint}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      <Beach y={1450} t={t} />
      <Chest x={260} y={1470} w={170} />
      <Pool x={790} y={1470} rx={260} ry={40} />
      <CalendarCard x={790} y={1120} day={current} w={260} />
      {torn.map((day, i) => {
        // Instant d'arrachage approximé par l'inverse de la loi d'accélération.
        const tear = (duration - 0.3) * ((i + 1) / (last - first)) ** (1 / 1.6);
        const e = Math.max(0, t - tear);
        if (e > 1.2) {
          return null;
        }
        const drift = random(`page-${day}`);
        return (
          <CalendarCard
            key={day}
            x={790 - e * (700 + drift * 300)}
            y={1120 - e * 260 + e * e * 240 * drift}
            day={day}
            w={150}
            rotate={-e * (240 + drift * 200)}
            opacity={1 - e / 1.2}
          />
        );
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 16. « Deux semaines. RIEN. Une semaine. Un bandage. Trois jours… »  */
/* ------------------------------------------------------------------ */

/** Rouleau de bandage. */
const Bandage: React.FC<{
  x: number;
  y: number;
  s: number;
  rotate: number;
}> = ({ x, y, s, rotate }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
    <rect
      x={-60}
      y={-40}
      width={120}
      height={80}
      rx={40}
      fill="#f1f4ff"
      stroke={palette.line}
      strokeWidth={4}
    />
    <ellipse
      cx={-60}
      cy={0}
      rx={14}
      ry={40}
      fill="#d7def5"
      stroke={palette.line}
      strokeWidth={4}
    />
    <path
      d="M-60,40 C-10,60 40,70 90,58 L92,82 C40,92 -10,86 -60,64 Z"
      fill="#f1f4ff"
      stroke={palette.line}
      strokeWidth={4}
    />
    <path
      d="M14,-14 v28 M0,0 h28"
      stroke="#ff6b5a"
      strokeWidth={8}
      strokeLinecap="round"
    />
  </g>
);

export const SceneCountdown: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1520;
  const opens = [
    { start: at("rien"), close: at("uneSemaine") - 0.1 },
    { start: at("bandage") - 0.05, close: at("troisJours") - 0.1 },
    { start: at("toujoursRien") + 0.05, close: 99 },
  ];
  const open = Math.max(
    ...opens.map((o) => inOut(t, o.start, o.close, 0.18, 0.2)),
  );
  const label =
    t < at("uneSemaine") ? "J-14" : t < at("troisJours") ? "J-7" : "J-3";
  const flipAt =
    t < at("uneSemaine")
      ? 0
      : t < at("troisJours")
        ? at("uneSemaine")
        : at("troisJours");
  const flip = flipAt === 0 ? 1 : progress(t, flipAt, 0.3);
  const bandage = progress(t, at("bandage"), 0.5);
  const bandageFall = progress(t, at("bandage") + 0.6, 0.35, easeIn);
  const signShake =
    t > at("toujoursRien")
      ? shake(t, 5 * Math.max(0, 1 - (t - at("toujoursRien")) / 0.8), 7)
      : 0;
  return (
    <Stage>
      <Moon x={880} y={760} r={36} />
      <Sea t={t} horizon={1200} moonX={880} />
      <Beam x={540} bottom={900} opacity={0.8} />
      <Beach y={ground - 10} t={t} />
      <Pool x={430} y={ground} rx={380} ry={60} />
      {/* Panneau du compte à rebours */}
      <g transform={`translate(${860 + signShake} 0)`}>
        <line
          x1={0}
          y1={ground - 12}
          x2={0}
          y2={1040}
          stroke={palette.line}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <g
          transform={`translate(0 1010) scale(1 ${0.55 + 0.45 * Math.abs(Math.cos(flip * Math.PI))})`}
        >
          <rect
            x={-130}
            y={-70}
            width={260}
            height={140}
            rx={20}
            fill={palette.ink}
            stroke={palette.line}
            strokeWidth={6}
            filter="url(#glow)"
          />
          <text
            y={30}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={84}
            fill={label === "J-3" ? "#ff8a6b" : palette.line}
          >
            {label}
          </text>
        </g>
      </g>
      <Chest x={430} y={ground} w={480} open={open} />
      {/* Contenu : poussière, puis un bandage */}
      {opens.map((o, i) =>
        i === 1 ? null : (
          <Burst
            key={i}
            x={430}
            y={ground - 250}
            elapsed={t - o.start - 0.1}
            count={40}
            spread={200}
            rise={120}
            duration={0.9}
            seed={`dust-${i}`}
            color="#9aa8cc"
          />
        ),
      )}
      {bandage > 0 && bandageFall < 1 ? (
        <Bandage
          x={430}
          y={ground - 250 - bandage * 220 + bandageFall * 220}
          s={0.6 + bandage * 0.4}
          rotate={wave(t, 1.2) * 12}
        />
      ) : null}
    </Stage>
  );
};

/* ------------------------------------------------------------------ */
/* 17. « Personne ne quitte L'ÉQUIPE. »                                 */
/* ------------------------------------------------------------------ */

export const SceneTeam: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1460;
  const bond = progress(t, at("equipe"), 0.35);
  const xs = [270, 450, 630, 810];
  // Hauteur des mains : épaule (hanche - 74) + projection verticale du bras.
  const handY = ground - LEG - 38;
  return (
    <Stage>
      <Moon x={860} y={760} r={36} />
      <Sea t={t} horizon={1230} moonX={860} />
      <Beam x={540} bottom={1000} opacity={0.85} />
      <Beach y={ground - 4} t={t} />
      <Pool x={540} y={ground} rx={460} ry={60} />
      {/* Le lien qui les tient */}
      <path
        d={`M${xs[0]},${handY} ${xs.map((x) => `L${x},${handY}`).join(" ")}`}
        fill="none"
        stroke={bond > 0 ? palette.goldLight : palette.lineSoft}
        strokeWidth={8 + bond * 6}
        filter={bond > 0 ? "url(#glowStrong)" : "url(#glow)"}
        opacity={0.5 + bond * 0.5}
      />
      {xs.map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={ground - LEG}
          hero={i === 1}
          pose={{ ...STAND, armL: [-62, -66], armR: [62, 66], nod: -4 }}
        />
      ))}
      <Dust
        t={t}
        area={[200, 700, 680, 700]}
        opacity={0.5}
        color={bond > 0 ? palette.goldLight : "#dfe8ff"}
      />
    </Stage>
  );
};
