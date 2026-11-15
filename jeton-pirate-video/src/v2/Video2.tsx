/**
 * Montage de la vidéo 2 (« la mission ») : même fond, mêmes sous-titres et
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
import { Backdrop, Finish } from "../components/Backdrop";
import { Captions } from "../components/Captions";
import { SvgDefs } from "../components/art/Defs";
import { clamp01 } from "../lib/anim";
import { AssetGate } from "../lib/assets";
import { SceneProvider, SceneShell, TRANSITION } from "../lib/scene";
import { TimelineProvider, toFrames } from "../lib/timelineTools";
import { VIDEO } from "../theme";
import {
  V2Clock,
  V2Countdown,
  V2Doubt,
  V2Lighthouse,
  V2Lockers,
  V2Map,
  V2Mission,
  V2Nights,
  V2Opening,
  V2Phone,
  V2Pier,
  V2Reveal,
  V2Share,
  V2Vocal,
  V2Wait,
  V2Wake,
} from "./scenes";
import { cues, timeline2 } from "./timeline";

export const tracksV2: Tracks = {
  voice: "audio/voix-off-2.mp3",
  music: "audio/musique-2.mp3",
  bed: "audio/bed.mp3",
};

const SCENES: { name: string; from: string | null; Component: React.FC }[] = [
  { name: "01 · Pour toujours", from: null, Component: V2Opening },
  { name: "02 · Regarder ?", from: "etToi", Component: V2Pier },
  { name: "03 · Une mission", from: "non", Component: V2Mission },
  { name: "04 · Tout le monde", from: "reveille", Component: V2Wake },
  { name: "05 · Toute l'équipe", from: "unSeul", Component: V2Share },
  { name: "06 · Le plan", from: "plan", Component: V2Map },
  { name: "07 · Les nuits", from: "soir1", Component: V2Nights },
  { name: "08 · Jamais", from: "doute", Component: V2Doubt },
  { name: "09 · 2 h 47", from: "tel", Component: V2Phone },
  { name: "10 · N'attendra pas", from: "attendre", Component: V2Wait },
  { name: "11 · 3, 2, 1", from: "troisJours", Component: V2Countdown },
  { name: "12 · 23:58", from: "dec4", Component: V2Clock },
  { name: "13 · En vocal", from: "vocal", Component: V2Vocal },
  { name: "14 · Sous le phare", from: "phare", Component: V2Lighthouse },
  { name: "15 · Il est là", from: "estLa", Component: V2Reveal },
  { name: "16 · Les casiers", from: "dec5Fin", Component: V2Lockers },
];

const LEAD = 0.06;
const sceneStarts = (): number[] =>
  SCENES.map((s) =>
    s.from === null ? 0 : Math.max(0, timeline2.cueAt(s.from) - LEAD),
  );

const { cueAt, cuePartAt } = timeline2;

const hitsV2 = (starts: number[]): Hit[] => [
  ...impactHits(cues),
  ...transitionHits(starts),
  { sound: "sparkle", at: 0.05, volume: 0.5, name: "Jeton : apparition" },
  {
    sound: "shatter",
    at: cueAt("toujours"),
    volume: 0.7,
    name: "Jeton : disparaît",
  },
  {
    sound: "buzz",
    at: cueAt("reveille"),
    volume: 0.4,
    name: "Appel de l'équipe",
  },
  {
    sound: "sparkle",
    at: cueAt("trouve") + 0.3,
    volume: 0.45,
    name: "Jeton trouvé",
  },
  {
    sound: "sparkle",
    at: cuePartAt("equipe", 1),
    volume: 0.45,
    name: "Jeton partagé",
  },
  {
    sound: "chest",
    at: cuePartAt("soir1", 1) - 0.1,
    volume: 0.6,
    name: "Coffre : rien",
  },
  {
    sound: "chest",
    at: cuePartAt("soir2", 1) - 0.1,
    volume: 0.6,
    name: "Coffre : munitions",
  },
  {
    sound: "chest",
    at: cuePartAt("soir3", 1) - 0.1,
    volume: 0.6,
    name: "Coffre : poisson",
  },
  {
    sound: "tick",
    at: cuePartAt("encore", 1) + 0.3,
    volume: 0.5,
    name: "Rejouer",
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    sound: "tick" as const,
    at: cueAt("dec4") + 0.15 + i * 0.13,
    volume: 0.25,
    name: `Horloge ${i + 1}`,
  })),
  {
    sound: "chest",
    at: cueAt("ouvres") + 0.15,
    volume: 0.7,
    name: "Le coffre s'ouvre",
  },
  { sound: "sparkle", at: cueAt("estLa"), volume: 0.6, name: "Il est là" },
  {
    sound: "sparkle",
    at: cuePartAt("casier", 2),
    volume: 0.6,
    name: "Les casiers",
  },
];

const FadeOut: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  const p = clamp01((t - (timeline2.total - 1.1)) / 1);
  return p > 0 ? (
    <AbsoluteFill style={{ background: "#000", opacity: p }} />
  ) : null;
};

export const JetonVideo2: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AssetGate files={soundFilesOf(tracksV2)}>
      <TimelineProvider value={timeline2}>
        <AbsoluteFill style={{ background: "#000" }}>
          <SvgDefs />
          <Backdrop />
          {SCENES.map((scene, i) => {
            const start = starts[i];
            const end =
              i + 1 < SCENES.length
                ? starts[i + 1] + TRANSITION
                : timeline2.total;
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
          <Soundtrack tracks={tracksV2} hits={hitsV2(starts)} />
        </AbsoluteFill>
      </TimelineProvider>
    </AssetGate>
  );
};
