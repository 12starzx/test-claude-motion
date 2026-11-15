/**
 * Montage de la vidéo 5 (« le blocus ») : même fond, mêmes sous-titres et
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
  V5Blocus,
  V5Call,
  V5Chance,
  V5Class,
  V5Deadline,
  V5Locker,
  V5Maths,
  V5Monday,
  V5Morning,
  V5NotGame,
  V5Scroll,
} from "./scenes";
import { cues, timeline5 } from "./timeline";

export const tracksV5: Tracks = {
  voice: "audio/voix-off-5.mp3",
  music: "audio/musique-5.mp3",
  bed: "audio/bed.mp3",
};

const SCENES: { name: string; from: string | null; Component: React.FC }[] = [
  { name: "01 · T'as cours", from: null, Component: V5Monday },
  {
    name: "02 · Toujours pas le jeton",
    from: "toujoursPas",
    Component: V5Scroll,
  },
  { name: "03 · Un blocus", from: "ecoute", Component: V5Blocus },
  { name: "04 · Pour le jeton", from: "maths", Component: V5Maths },
  { name: "05 · Moins de 3 semaines", from: "dec5", Component: V5Deadline },
  { name: "06 · Une chance en moins", from: "chaqueSoir", Component: V5Chance },
  { name: "07 · Fatigué", from: "fatigue", Component: V5Class },
  { name: "08 · De ce mardi", from: "dixAns", Component: V5Locker },
  { name: "09 · L'appel", from: "rappelle", Component: V5Call },
  { name: "10 · C'est un blocus", from: "partie", Component: V5NotGame },
  { name: "11 · Lundi matin", from: "quandMeme", Component: V5Morning },
];

const LEAD = 0.06;
const sceneStarts = (): number[] =>
  SCENES.map((s) =>
    s.from === null ? 0 : Math.max(0, timeline5.cueAt(s.from) - LEAD),
  );

const { cueAt, cuePartAt } = timeline5;

const hitsV5 = (starts: number[]): Hit[] => [
  ...impactHits(cues),
  ...transitionHits(starts),
  { sound: "buzz", at: cueAt("cours"), volume: 0.45, name: "Réveil" },
  { sound: "chest", at: cuePartAt("blocus", 1), volume: 0.5, name: "Porte" },
  {
    sound: "sparkle",
    at: cueAt("pourJeton"),
    volume: 0.5,
    name: "Pour le jeton",
  },
  {
    sound: "shatter",
    at: cuePartAt("dec5", 1),
    volume: 0.45,
    name: "Il disparaît",
  },
  {
    sound: "sparkle",
    at: cuePartAt("personne", 1),
    volume: 0.5,
    name: "Casier",
  },
  { sound: "buzz", at: cueAt("rappelle"), volume: 0.4, name: "Équipe" },
  { sound: "chest", at: cueAt("coffre") + 0.1, volume: 0.6, name: "Coffre" },
  {
    sound: "sparkle",
    at: cuePartAt("avecJeton", 1),
    volume: 0.6,
    name: "Avec le jeton",
  },
];

const FadeOut: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  const p = clamp01((t - (timeline5.total - 1.1)) / 1);
  return p > 0 ? (
    <AbsoluteFill style={{ background: "#000", opacity: p }} />
  ) : null;
};

export const JetonVideo5: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AssetGate files={soundFilesOf(tracksV5)}>
      <TimelineProvider value={timeline5}>
        <AbsoluteFill style={{ background: "#000" }}>
          <SvgDefs />
          <Backdrop />
          {SCENES.map((scene, i) => {
            const start = starts[i];
            const end =
              i + 1 < SCENES.length
                ? starts[i + 1] + TRANSITION
                : timeline5.total;
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
          <Soundtrack tracks={tracksV5} hits={hitsV5(starts)} />
        </AbsoluteFill>
      </TimelineProvider>
    </AssetGate>
  );
};
