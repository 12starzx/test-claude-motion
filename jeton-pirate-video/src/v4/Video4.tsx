/**
 * Montage de la vidéo 4 (« GTA 6 : treize ans ») : même fond, mêmes sous-titres et
 * même mixage que la vidéo 1, avec son propre conducteur, ses scènes et son son.
 */
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  impactHits,
  Soundtrack,
  soundFilesOf,
  transitionHits,
} from "../audio/Soundtrack";
import type { Hit, Tracks } from "../audio/Soundtrack";
import { Finish } from "../components/Backdrop";
import { SunsetBackdrop } from "./props";
import { Captions } from "../components/Captions";
import { SvgDefs } from "../components/art/Defs";
import { clamp01 } from "../lib/anim";
import { AssetGate } from "../lib/assets";
import { SceneProvider, SceneShell, TRANSITION } from "../lib/scene";
import { TimelineProvider, toFrames } from "../lib/timelineTools";
import { VIDEO } from "../theme";
import {
  V4Build,
  V4Choice,
  V4Countdown,
  V4Delays,
  V4Guess,
  V4Hype,
  V4Leonida,
  V4Polish,
  V4Release,
  V4Statement,
  V4Trailer1,
  V4Trailer2,
  V4ViceCity,
  V4Years,
} from "./scenes";
import { cues, timeline4 } from "./timeline";

export const tracksV4: Tracks = {
  voice: "audio/voix-off-4.mp3",
  music: "audio/musique-4.mp3",
  bed: "audio/bed.mp3",
};

const SCENES: { name: string; from: string | null; Component: React.FC }[] = [
  { name: "01 · 2013", from: null, Component: V4Release },
  { name: "02 · 2017 ?", from: "tuTeDis", Component: V4Guess },
  { name: "03 · Tu attends toujours", from: "treize", Component: V4Years },
  { name: "04 · Premier trailer", from: "dec2023", Component: V4Trailer1 },
  { name: "05 · 2025", from: "croit", Component: V4Hype },
  { name: "06 · Les reports", from: "report1", Component: V4Delays },
  { name: "07 · Finition", from: "rockstar", Component: V4Polish },
  { name: "08 · Zéro raccourci", from: "deuxReports", Component: V4Statement },
  { name: "09 · Deuxième trailer", from: "mai2025", Component: V4Trailer2 },
  { name: "10 · Vice City", from: "monde", Component: V4ViceCity },
  { name: "11 · Attendre ou avancer", from: "etToi", Component: V4Choice },
  { name: "12 · Ce qui est grand", from: "lecon", Component: V4Build },
  { name: "13 · Leonida", from: "jeudi", Component: V4Leonida },
  { name: "14 · Quelques jours", from: "attente", Component: V4Countdown },
];

const LEAD = 0.06;
const sceneStarts = (): number[] =>
  SCENES.map((s) =>
    s.from === null ? 0 : Math.max(0, timeline4.cueAt(s.from) - LEAD),
  );

const { cueAt, cuePartAt } = timeline4;

const hitsV4 = (starts: number[]): Hit[] => [
  ...impactHits(cues),
  ...transitionHits(starts),
  { sound: "sparkle", at: cueAt("gta5"), volume: 0.45, name: "GTA 5" },
  ...Array.from({ length: 13 }, (_, i) => ({
    sound: "tick" as const,
    at: cueAt("treize") + 0.1 + i * 0.075,
    volume: 0.2,
    name: `Année ${2014 + i}`,
  })),
  {
    sound: "chest",
    at: cueAt("report1") + 0.25,
    volume: 0.5,
    name: "Tampon 1",
  },
  {
    sound: "chest",
    at: cueAt("report2") + 0.25,
    volume: 0.5,
    name: "Tampon 2",
  },
  { sound: "sparkle", at: cueAt("novembre"), volume: 0.45, name: "Novembre" },
  {
    sound: "sparkle",
    at: cuePartAt("monde", 1),
    volume: 0.5,
    name: "Vice City",
  },
  {
    sound: "sparkle",
    at: cuePartAt("arriver", 1),
    volume: 0.5,
    name: "Arriver",
  },
  { sound: "sparkle", at: cueAt("jeudi"), volume: 0.6, name: "19 novembre" },
  {
    sound: "buzz",
    at: cuePartAt("jours", 1),
    volume: 0.35,
    name: "Notification",
  },
];

const FadeOut: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  const p = clamp01((t - (timeline4.total - 1.1)) / 1);
  return p > 0 ? (
    <AbsoluteFill style={{ background: "#000", opacity: p }} />
  ) : null;
};

export const JetonVideo4: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AssetGate files={soundFilesOf(tracksV4)}>
      <TimelineProvider value={timeline4}>
        <AbsoluteFill style={{ background: "#000" }}>
          <SvgDefs />
          <SunsetBackdrop />
          {SCENES.map((scene, i) => {
            const start = starts[i];
            const end =
              i + 1 < SCENES.length
                ? starts[i + 1] + TRANSITION
                : timeline4.total;
            const duration = end - start;
            return (
              <Sequence
                key={scene.name}
                name={scene.name}
                from={toFrames(start)}
                durationInFrames={toFrames(duration)}
              >
                <SceneProvider value={{ start, duration }}>
                  <SceneShell>
                    <scene.Component />
                  </SceneShell>
                </SceneProvider>
              </Sequence>
            );
          })}
          <Captions />
          <Finish />
          <FadeOut />
          <Soundtrack tracks={tracksV4} hits={hitsV4(starts)} />
        </AbsoluteFill>
      </TimelineProvider>
    </AssetGate>
  );
};
