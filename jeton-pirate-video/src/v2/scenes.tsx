/**
 * Scènes de la vidéo 2 (« la mission »). Même grammaire visuelle que la
 * vidéo 1, nouveaux décors : phare, bouée, carte des îles, épave, nuits de
 * fouille, téléphone, compte à rebours, vocal, casiers.
 */
import { bodyFont, impactFont } from "../fonts";
import { easeInOut, inOut, mix, pop, progress, shake, wave } from "../lib/anim";
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
  BookStack,
  CalendarCard,
  Chest,
  Clock,
  Phone,
  Plate,
  SquadCard,
} from "../components/art/Props";
import { SQUAD, SQUAD_X } from "../scenes/Act1";
import { Badge, Beach, Floor } from "../scenes/common";
import {
  Ammo,
  Buoy,
  Fish,
  GameScreen,
  Island,
  Lighthouse,
  Locker,
  VoiceWave,
  Wreck,
} from "./props";

/* 1. « Le 5 décembre, le jeton pirate disparaît. POUR TOUJOURS. » ------ */
export const V2Opening: React.FC = () => {
  const { t, at } = useSceneTime();
  const gone = at("toujours");
  const fade = 1 - progress(t, gone, 0.4);
  const appear = pop(t, 0.05);
  const bob = wave(t, 2.2) * 8;
  return (
    <Stage>
      <Moon x={190} y={740} r={36} />
      <Sea t={t} horizon={1180} moonX={190} />
      <Lighthouse x={900} y={1185} h={380} sweep={t * 70} />
      {/* Ronds dans l'eau autour de la bouée */}
      {[0, 1, 2].map((i) => {
        const p = (t * 0.5 + i / 3) % 1;
        return (
          <ellipse
            key={i}
            cx={470}
            cy={1420}
            rx={120 + p * 260}
            ry={18 + p * 40}
            fill="none"
            stroke={palette.line}
            strokeWidth={3}
            opacity={(1 - p) * 0.4}
          />
        );
      })}
      <Buoy x={470} y={1420} bob={bob}>
        <CalendarCard x={0} y={-70} day={5} w={210} />
      </Buoy>
      <Token
        x={470}
        y={900 + bob}
        r={115 * appear}
        spin={t * 14}
        rays={0.7 * fade}
        glow={fade}
        opacity={fade}
      />
      <Burst
        x={470}
        y={900}
        elapsed={t - gone}
        count={120}
        spread={340}
        rise={280}
        duration={1.2}
        seed="v2open"
      />
    </Stage>
  );
};

/* 2. « Et toi, tu comptes faire quoi ? Regarder ? » ------------------- */
export const V2Pier: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1330;
  const play = pop(t, at("regarder"));
  return (
    <Stage>
      <Moon x={860} y={740} r={36} />
      <Sea t={t} horizon={1150} moonX={860} />
      <Beam x={380} bottom={700} opacity={0.75} />
      {/* Ponton */}
      <rect
        x={-60}
        y={ground}
        width={640}
        height={36}
        rx={6}
        fill={palette.ink}
        stroke={palette.line}
        strokeWidth={5}
        filter="url(#glow)"
      />
      {[60, 260, 460].map((x) => (
        <line
          key={x}
          x1={x}
          y1={ground + 36}
          x2={x}
          y2={1560}
          stroke={palette.line}
          strokeWidth={10}
        />
      ))}
      <Pool x={420} y={ground} rx={260} ry={40} />
      {/* Le héros assis au bout du ponton, le téléphone à la main */}
      <Figure
        x={480}
        y={ground - 6}
        pose={{
          ...SIT,
          legL: [88, 10],
          legR: [92, 16],
          armL: [30, 110],
          armR: [40, 115],
          nod: 24,
        }}
        hero
      />
      <g transform="translate(560 1240)">
        <circle r={70} fill="url(#poolFill)" opacity={0.8} />
        <Phone x={0} y={0} scale={0.42} ring={0} rotate={-12} />
        {play > 0 ? (
          <path
            d="M-8,-14 L14,0 L-8,14 Z"
            fill={palette.gold}
            transform={`rotate(-12) scale(${play})`}
          />
        ) : null}
      </g>
    </Stage>
  );
};

/* 3. « NON. Ce soir… Tu lances UNE MISSION. » -------------------------- */
export const V2Mission: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const crossed = progress(t, at("partie") + 0.8, 0.4);
  const mission = progress(t, atPart("mission", 1), 0.3);
  const stand = pop(t, 0.05);
  const jolt = t > at("partie") && t < at("partie") + 0.2 ? shake(t, 4, 9) : 0;
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.7 + mission * 0.3} />
      <Floor y={1500} t={t} />
      {mission > 0 ? (
        <circle
          cx={540}
          cy={1000}
          r={520}
          fill="url(#goldHalo)"
          opacity={mission * 0.5}
        />
      ) : null}
      <GameScreen x={540 + jolt} y={1000} crossed={crossed} mission={mission} />
      <Figure
        x={200}
        y={1500 - LEG}
        hero
        pose={blendPose(
          STAND,
          { ...STAND, armR: [120, 140], nod: -10 },
          mission,
        )}
        opacity={stand}
      />
    </Stage>
  );
};

/* 4. « Réveille ton équipe. TOUT LE MONDE. Même celui qui jure… » ------- */
export const V2Wake: React.FC = () => {
  const { t, at } = useSceneTime();
  const cardY = 1120;
  const ping = progress(t, 0.2, 1.0);
  const all = (i: number) => progress(t, at("toutLeMonde") + i * 0.12, 0.2);
  const quit = at("memeCelui");
  const back = pop(t, at("arrete") + 0.5);
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.7} />
      <line
        x1={60}
        y1={1330}
        x2={1020}
        y2={1330}
        stroke={palette.lineFaint}
        strokeWidth={3}
      />
      {/* Onde d'appel depuis la carte du héros */}
      {ping > 0 && ping < 1 ? (
        <circle
          cx={SQUAD_X[0]}
          cy={cardY}
          r={80 + ping * 900}
          fill="none"
          stroke={palette.hero}
          strokeWidth={6}
          opacity={1 - ping}
          filter="url(#glow)"
        />
      ) : null}
      {SQUAD.map((m, i) => {
        const isQuitter = i === 3;
        const online = i === 0 ? 1 : isQuitter ? back : all(i);
        return (
          <SquadCard
            key={m.name}
            x={SQUAD_X[i]}
            y={cardY - (isQuitter ? back * 18 : 0)}
            name={m.name}
            hero={m.hero}
            online={online}
            dim={(1 - online) * 0.9}
            gold={isQuitter ? back * 0.6 : 0}
            t={t}
          />
        );
      })}
      {/* L'étiquette « A ARRÊTÉ » du dernier, qui bascule « EN LIGNE » */}
      {t > quit - 0.1 ? (
        <g
          transform={`translate(${SQUAD_X[3]} 900)`}
          opacity={progress(t, quit, 0.2)}
        >
          <rect
            x={-100}
            y={-28}
            width={200}
            height={56}
            rx={28}
            fill={palette.ink}
            stroke={back > 0.5 ? palette.hero : "#ff6b5a"}
            strokeWidth={4}
          />
          <text
            y={11}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={800}
            fontSize={26}
            fill={back > 0.5 ? palette.hero : "#ff8a6b"}
          >
            {back > 0.5 ? "EN LIGNE" : "A ARRÊTÉ"}
          </text>
        </g>
      ) : null}
    </Stage>
  );
};

/* 5. « Il suffit qu'un seul d'entre vous le trouve, et TOUTE L'ÉQUIPE… » */
export const V2Share: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1460;
  const xs = [250, 430, 650, 830];
  const found = pop(t, at("trouve") + 0.3);
  const share = atPart("equipe", 1);
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
                r={64 * Math.min(1, p * 1.4)}
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

/* 6. « Le plan est simple. CHAQUE ÎLE. CHAQUE ÉPAVE. CHAQUE COFFRE. » -- */
export const V2Map: React.FC = () => {
  const { t, at } = useSceneTime();
  const route = progress(t, 0.2, at("coffre") + 0.2, (v) => v);
  const ile = pop(t, at("ile"));
  const epave = pop(t, at("epave"));
  const coffre = pop(t, at("coffre"));
  const pts: [number, number][] = [
    [200, 1420],
    [320, 1010],
    [620, 1150],
    [800, 870],
    [860, 1360],
  ];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` C${x0 + 120},${y0} ${x1 - 120},${y1} ${x1},${y1}`;
  }
  return (
    <Stage>
      <Beam x={540} bottom={1100} opacity={0.5} />
      {/* Carte marine */}
      <rect
        x={70}
        y={740}
        width={940}
        height={800}
        rx={36}
        fill="#0b1738"
        stroke={palette.line}
        strokeWidth={6}
        filter="url(#glow)"
      />
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={70 + (i + 1) * 117}
          y1={740}
          x2={70 + (i + 1) * 117}
          y2={1540}
          stroke={palette.lineFaint}
          strokeWidth={2}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={70}
          y1={740 + (i + 1) * 114}
          x2={1010}
          y2={740 + (i + 1) * 114}
          stroke={palette.lineFaint}
          strokeWidth={2}
        />
      ))}
      {/* Rose des vents */}
      <g transform="translate(180 860)" opacity={0.8}>
        <polygon points="0,-60 12,0 0,60 -12,0" fill={palette.line} />
        <polygon points="-60,0 0,-12 60,0 0,12" fill={palette.lineSoft} />
        <text
          y={-70}
          textAnchor="middle"
          fontFamily={impactFont}
          fontWeight={800}
          fontSize={24}
          fill={palette.line}
        >
          N
        </text>
      </g>
      <Island x={320} y={1010} s={1.1} highlight={ile} />
      <Island x={800} y={870} s={0.9} />
      <Island x={600} y={1400} s={0.8} />
      <path
        d={d}
        fill="none"
        stroke={palette.goldLight}
        strokeWidth={6}
        strokeDasharray="16 14"
        opacity={0.9}
        style={{ clipPath: `inset(0 ${100 - route * 100}% 0 0)` }}
      />
      <g transform={`translate(620 1150) scale(${epave})`}>
        <circle
          r={100}
          fill="none"
          stroke={palette.goldLight}
          strokeWidth={6}
          opacity={epave > 0.5 ? 1 : 0}
          filter="url(#glow)"
        />
        <Wreck x={0} y={10} s={1} />
      </g>
      <g transform={`translate(860 1360) scale(${coffre})`}>
        <circle r={100} fill="url(#goldHalo)" />
        <Chest x={0} y={40} w={120} light={0.6} />
        <path
          d="M-40,-90 l30,30 m0,-30 l-30,30"
          stroke="#ff6b5a"
          strokeWidth={8}
          strokeLinecap="round"
          transform="translate(20 0)"
        />
      </g>
      <Figure x={200} y={1420 - LEG * 0.5} scale={0.5} hero />
    </Stage>
  );
};

/* 7. « Premier soir : RIEN. Deuxième : des munitions. Troisième : un poisson. » */
export const V2Nights: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1500;
  const o1 = atPart("soir1", 1);
  const o2 = atPart("soir2", 1);
  const o3 = atPart("soir3", 1);
  const big = at("poisson");
  const open = Math.max(
    inOut(t, o1 - 0.1, at("soir2"), 0.2, 0.25),
    inOut(t, o2 - 0.1, at("soir3"), 0.2, 0.25),
    progress(t, o3 - 0.1, 0.2),
  );
  const night = t < at("soir2") ? 1 : t < at("soir3") ? 2 : 3;
  const ammo = inOut(t, o2, at("soir3"), 0.3, 0.2);
  const fishJump = progress(t, o3, 0.5);
  const fishBig = pop(t, big, 140);
  const fishY =
    mix(ground - 220, 1000, fishJump) + Math.sin(fishJump * Math.PI) * -120;
  return (
    <Stage>
      <Moon x={860} y={760} r={30 + night * 4} />
      <Sea t={t} horizon={1230} moonX={860} />
      <Beam x={540} bottom={900} opacity={0.85} />
      {/* Encoches des nuits */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${130 + i * 70} 780)`}>
          <circle
            r={22}
            fill={i < night ? palette.goldLight : "none"}
            stroke={palette.line}
            strokeWidth={4}
          />
        </g>
      ))}
      <Beach y={ground - 6} t={t} />
      <Pool x={540} y={ground} rx={340} ry={56} />
      <Chest x={540} y={ground} w={420} open={open} />
      <Burst
        x={540}
        y={ground - 240}
        elapsed={t - o1}
        count={40}
        spread={180}
        rise={120}
        duration={0.9}
        seed="v2dust"
        color="#9aa8cc"
      />
      {ammo > 0 ? (
        <Ammo x={540} y={ground - 300 - ammo * 40} s={1.3 * ammo} />
      ) : null}
      {fishJump > 0 ? (
        <Fish
          x={540 + fishBig * 0}
          y={fishY + (fishBig > 0 ? -fishBig * 40 : 0)}
          s={1.1 + fishBig * 1.6}
          rotate={fishBig > 0.2 ? wave(t, 0.35) * 14 : mix(-40, 10, fishJump)}
          blink={Math.sin(t * 9) > 0.92 ? 1 : 0}
        />
      ) : null}
    </Stage>
  );
};

/* 8. « Tes potes commencent à douter. Toi, JAMAIS. » ------------------- */
export const V2Doubt: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const ground = 1460;
  const never = pop(t, atPart("jamais", 1), 180);
  return (
    <Stage>
      <Beam x={800} bottom={500} opacity={0.6 + never * 0.4} />
      <Floor y={ground} t={t} />
      <Pool
        x={800}
        y={ground}
        rx={200}
        ry={40}
        gold={never > 0.3}
        opacity={0.5 + never * 0.5}
      />
      {[180, 330, 480].map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={ground - LEG}
          pose={{ ...STAND, armL: [-4, -2], armR: [4, 2], nod: 32, lean: 10 }}
          opacity={0.55}
          facing={i === 1 ? -1 : 1}
        />
      ))}
      <Figure
        x={800}
        y={ground - LEG}
        scale={1.15}
        hero
        pose={blendPose(STAND, { ...STAND, armR: [168, 178], nod: -12 }, never)}
      />
      <Burst
        x={830}
        y={1180}
        elapsed={t - atPart("jamais", 1)}
        count={60}
        spread={220}
        rise={200}
        duration={1.2}
        seed="never"
      />
    </Stage>
  );
};

/* 9. « Ton téléphone affiche 2 h 47. Tu te dis : ENCORE UNE. » --------- */
export const V2Phone: React.FC = () => {
  const { t, atPart } = useSceneTime();
  const again = atPart("encore", 1);
  const swap = progress(t, again, 0.25);
  const tap = progress(t, again + 0.3, 0.5);
  const enter = pop(t, 0.05, 120);
  return (
    <Stage>
      <Beam x={540} bottom={800} opacity={0.5} />
      <Dust t={t} area={[200, 700, 680, 800]} opacity={0.4} />
      <g
        transform={`translate(540 ${1130 + (1 - enter) * 300}) scale(${0.95 + enter * 0.05})`}
      >
        <circle r={520} fill="url(#poolFill)" opacity={0.6} />
        <rect
          x={-210}
          y={-400}
          width={420}
          height={800}
          rx={56}
          fill={palette.ink}
          stroke={palette.line}
          strokeWidth={8}
          filter="url(#glow)"
        />
        <rect
          x={-180}
          y={-360}
          width={360}
          height={720}
          rx={26}
          fill="#101f4c"
        />
        <g opacity={1 - swap}>
          <text
            y={-150}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={800}
            fontSize={150}
            fill={palette.line}
          >
            2:47
          </text>
          <text
            y={-80}
            textAnchor="middle"
            fontFamily={bodyFont}
            fontWeight={500}
            fontSize={34}
            fill={palette.lineSoft}
          >
            Batterie 9 %
          </text>
          <rect
            x={-130}
            y={60}
            width={260}
            height={10}
            rx={5}
            fill={palette.lineFaint}
          />
        </g>
        <g opacity={swap}>
          <rect
            x={-150}
            y={-60}
            width={300}
            height={120}
            rx={60}
            fill={palette.gold}
            filter="url(#glowStrong)"
          />
          <text
            y={20}
            textAnchor="middle"
            fontFamily={impactFont}
            fontWeight={900}
            fontSize={50}
            fill={palette.ink}
          >
            REJOUER
          </text>
          {tap > 0 && tap < 1 ? (
            <circle
              r={40 + tap * 160}
              fill="none"
              stroke={palette.goldLight}
              strokeWidth={6}
              opacity={1 - tap}
            />
          ) : null}
        </g>
      </g>
    </Stage>
  );
};

/* 10. « Tout le reste peut attendre. Le 5 décembre, lui, N'ATTENDRA PAS. » */
export const V2Wait: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const floor = 1480;
  const dim = progress(t, 0.3, 1.0);
  const cal = pop(t, at("dec5b") + 0.1);
  const slam = atPart("dec5b", 1);
  const hit = t > slam && t < slam + 0.35 ? shake(t, 10, 4) : 0;
  return (
    <Stage>
      <Beam x={540} bottom={800} opacity={0.4 + cal * 0.5} />
      <Floor y={floor} t={t} />
      <g opacity={1 - dim * 0.65} style={{ filter: `grayscale(${dim})` }}>
        <BookStack x={220} y={floor} count={5} w={150} />
        <Plate x={540} y={floor - 30} t={t} scale={1.1} />
        <Clock
          x={860}
          y={floor - 120}
          r={110}
          hour={(t * 40) % 360}
          minute={(t * 480) % 360}
        />
      </g>
      {cal > 0 ? (
        <g transform={`translate(${540 + hit} 960) scale(${cal})`}>
          <circle
            r={300}
            fill="url(#goldHalo)"
            opacity={t > slam ? 0.9 : 0.4}
          />
          <CalendarCard x={0} y={0} day={5} w={330} highlight={t > slam} />
        </g>
      ) : null}
    </Stage>
  );
};

/* 11. « Plus que 3 JOURS. PUIS 2. PUIS 1. » ---------------------------- */
export const V2Countdown: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const steps = [atPart("troisJours", 1), at("deux"), at("un")];
  const days = [3, 2, 1];
  const idx = steps.filter((s) => t >= s).length - 1;
  const day = days[Math.max(0, idx)];
  const flip = idx >= 0 ? progress(t, steps[idx], 0.25) : 0;
  return (
    <Stage>
      <Moon x={860} y={740} r={34} />
      <Sea t={t} horizon={1300} moonX={860} />
      <Beam x={540} bottom={900} opacity={0.8} />
      {/* Feuillets arrachés qui s'envolent */}
      {days.slice(0, Math.max(0, idx)).map((d, i) => {
        const e = t - steps[i + 1];
        if (e < 0 || e > 1.2) return null;
        return (
          <CalendarCard
            key={d}
            x={540 - e * 700}
            y={1000 - e * 300 + e * e * 200}
            day={d}
            w={300}
            rotate={-e * 260}
            opacity={1 - e / 1.2}
          />
        );
      })}
      <g transform={`translate(540 1000) scale(${0.9 + 0.1 * flip})`}>
        <circle
          r={340}
          fill="url(#goldHalo)"
          opacity={0.25 + (3 - day) * 0.2}
        />
        <CalendarCard x={0} y={0} day={day} w={420} highlight={day === 1} />
      </g>
    </Stage>
  );
};

/* 12. « Le 4 décembre. 23:58. » ------------------------------------------ */
export const V2Clock: React.FC = () => {
  const { t, at } = useSceneTime();
  const spin = progress(t, 0.1, 1.2, easeInOut);
  // 20:00 → 23:58
  const hour = mix(240, 359, spin);
  const minute = mix(0, 3 * 360 + 348, spin);
  const digital = pop(t, at("heure"), 200);
  return (
    <Stage>
      <Beam x={540} bottom={900} opacity={0.8} />
      <Pool x={540} y={1500} rx={420} ry={60} />
      <Clock x={540} y={1010} r={230} hour={hour} minute={minute} />
      <CalendarCard
        x={290}
        y={1430}
        day={4}
        w={210}
        opacity={pop(t, 0.1)}
        rotate={-5}
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
          23:58
        </text>
      </Badge>
    </Stage>
  );
};

/* 13. « Toute l'équipe est en vocal. Plus personne ne parle. » --------- */
export const V2Vocal: React.FC = () => {
  const { t, at } = useSceneTime();
  const cardY = 1080;
  const hush = progress(t, at("silence") + 0.3, 0.8);
  return (
    <Stage>
      <Stars
        t={t}
        count={30}
        area={[0, 650, 1080, 300]}
        seed="vocal"
        opacity={0.6}
      />
      <Beam x={540} bottom={1050} opacity={0.6} />
      <line
        x1={60}
        y1={1420}
        x2={1020}
        y2={1420}
        stroke={palette.lineFaint}
        strokeWidth={3}
      />
      {SQUAD.map((m, i) => (
        <g key={m.name}>
          <SquadCard
            x={SQUAD_X[i]}
            y={cardY}
            name={m.name}
            hero={m.hero}
            online={1}
            t={t}
          />
          {/* Casque */}
          <path
            d={`M${SQUAD_X[i] - 46},${cardY - 70} C${SQUAD_X[i] - 46},${cardY - 140} ${SQUAD_X[i] + 46},${cardY - 140} ${SQUAD_X[i] + 46},${cardY - 70}`}
            fill="none"
            stroke={palette.line}
            strokeWidth={6}
          />
          <VoiceWave
            x={SQUAD_X[i]}
            y={1300}
            t={t}
            level={
              (1 - hush) * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i * 2)))
            }
            seed={i * 3}
            color={m.hero ? palette.hero : palette.mate}
          />
        </g>
      ))}
    </Stage>
  );
};

/* 14. « Un coffre brille sous le phare. Tu t'approches. Tu l'ouvres. » -- */
export const V2Lighthouse: React.FC = () => {
  const { t, at } = useSceneTime();
  const ground = 1480;
  const stop = at("ouvres") - 0.1;
  const heroX = mix(
    130,
    470,
    progress(Math.min(t, stop), 0, stop, (v) => v),
  );
  const walking = t < stop;
  const reach = pop(t, stop, 160);
  const crack = progress(t, at("ouvres") + 0.15, 0.6);
  const pulse = 0.45 + 0.2 * wave(t, 1.1);
  return (
    <Stage>
      <Moon x={170} y={740} r={34} />
      <Sea t={t} horizon={1250} moonX={170} />
      <Lighthouse x={800} y={1300} h={520} sweep={t * 60} />
      <Beach y={ground - 6} t={t} tilt={-10} />
      <Pool
        x={640}
        y={ground}
        rx={260}
        ry={46}
        gold
        opacity={pulse + crack * 0.4}
      />
      <Chest
        x={640}
        y={ground}
        w={220}
        open={crack * 0.35}
        light={pulse + crack * 0.5}
      />
      {[1, 2, 3].map((k) => (
        <Figure
          key={k}
          x={heroX - 115 * k}
          y={ground - LEG * (1 - k * 0.06)}
          scale={1 - k * 0.06}
          pose={walking ? walkPose(t * 1.6 + k * 0.27) : STAND}
          opacity={0.9 - k * 0.1}
        />
      ))}
      <Figure
        x={heroX}
        y={ground - LEG}
        hero
        pose={
          walking
            ? walkPose(t * 1.6)
            : (blendPose(
                STAND,
                { ...STAND, armR: [110, 120], nod: 16, lean: 14 },
                reach,
              ) as Pose)
        }
      />
      <Dust
        t={t}
        area={[480, 900, 360, 500]}
        color={palette.goldLight}
        opacity={0.6}
      />
    </Stage>
  );
};

/* 15. « IL EST LÀ. Le jeton. Pour toi. Pour eux. Pour TOUTE L'ÉQUIPE. » - */
export const V2Reveal: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1520;
  const xs = [250, 430, 650, 830];
  const rise = progress(t, 0.05, 0.9, easeInOut);
  const toYou = progress(t, at("pourToi"), 0.5);
  const toThem = (i: number) => progress(t, at("pourEux") + i * 0.1, 0.5);
  const all = pop(t, atPart("pourEquipe", 1));
  const mainX = mix(540, xs[1], toYou);
  const mainY = mix(mix(1500, 950, rise), 1060, toYou);
  const mainR = mix(150, 70, toYou);
  return (
    <Stage>
      <Beam x={540} bottom={1000} opacity={0.7} />
      <circle
        cx={540}
        cy={1100}
        r={720}
        fill="url(#goldHalo)"
        opacity={0.35 + rise * 0.3 - toYou * 0.2 + all * 0.3}
      />
      <Beach y={ground - 6} t={t} />
      <Burst
        x={540}
        y={1400}
        elapsed={t - 0.05}
        count={120}
        spread={400}
        rise={380}
        duration={1.6}
        seed="v2reveal"
      />
      {xs.map((x, i) => (
        <Figure
          key={x}
          x={x}
          y={ground - LEG}
          hero={i === 1}
          pose={blendPose(STAND, { ...STAND, armR: [150, 168], nod: -14 }, all)}
        />
      ))}
      {[0, 2, 3].map((i, k) => {
        const p = toThem(k);
        if (p <= 0) return null;
        return (
          <Token
            key={i}
            x={mix(xs[1], xs[i], p)}
            y={1060 - Math.sin(p * Math.PI) * 110}
            r={70 * Math.min(1, p * 1.5)}
            spin={t * 25}
            rays={0.4 + all * 0.5}
          />
        );
      })}
      <Token x={mainX} y={mainY} r={mainR} spin={t * 18} rays={0.9} glow={1} />
      <Dust
        t={t}
        area={[120, 700, 840, 800]}
        color={palette.goldLight}
        opacity={0.8}
        count={60}
      />
    </Stage>
  );
};

/* 16. « Le 5 décembre, le jeton disparaît… mais PAS DE VOTRE CASIER. » -- */
export const V2Lockers: React.FC = () => {
  const { t, at, atPart } = useSceneTime();
  const ground = 1500;
  const ghost = 1 - progress(t, at("disparaitFin") + 0.3, 0.6);
  const openAt = atPart("casier", 2);
  return (
    <Stage>
      <Beam x={540} bottom={1100} opacity={0.85} />
      <Floor y={ground} t={t} />
      <Pool
        x={540}
        y={ground}
        rx={480}
        ry={60}
        gold
        opacity={progress(t, openAt, 0.4)}
      />
      {/* Le jeton fantôme qui s'efface */}
      <Token
        x={540}
        y={820}
        r={90}
        spin={t * 10}
        rays={0}
        glow={ghost * 0.5}
        opacity={ghost * 0.6}
      />
      <Burst
        x={540}
        y={820}
        elapsed={t - (at("disparaitFin") + 0.3)}
        count={70}
        spread={240}
        rise={160}
        duration={1}
        seed="ghost"
      />
      {SQUAD.map((m, i) => {
        const open = progress(t, openAt + i * 0.09, 0.35);
        return (
          <Locker
            key={m.name}
            x={SQUAD_X[i]}
            y={ground}
            name={m.name}
            hero={m.hero}
            open={open}
          >
            <Token
              x={0}
              y={-230}
              r={58}
              spin={t * 20 + i * 30}
              rays={0.5}
              glow={1}
            />
          </Locker>
        );
      })}
    </Stage>
  );
};
