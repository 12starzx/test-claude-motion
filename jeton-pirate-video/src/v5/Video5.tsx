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
  V5Brother,
  V5Day,
  V5Final,
  V5Gate,
  V5Home,
  V5Homework,
  V5Last,
  V5Mother,
  V5Stake,
  V5Team,
} from "./scenes";
import { cues, timeline5 } from "./timeline";

export const tracksV5: Tracks = {
  voice: "audio/voix-off-5.mp3",
  music: "audio/musique-5.mp3",
  bed: "audio/bed.mp3",
};

const SCENES: { name: string; from: string | null; Component: React.FC }[] = [
  { name: "01 · Il disparaît", from: null, Component: V5Stake },
  { name: "02 · Le blocus", from: "cours", Component: V5Gate },
  { name: "03 · À la maison", from: "maison", Component: V5Home },
  { name: "04 · Revendications", from: "mere", Component: V5Mother },
  { name: "05 · La vaisselle", from: "frere", Component: V5Brother },
  { name: "06 · Le 6", from: "devoirs", Component: V5Homework },
  { name: "07 · L'équipe", from: "equipeQ", Component: V5Team },
  { name: "08 · La journée", from: "midi", Component: V5Day },
  { name: "09 · 23:59", from: "h2359", Component: V5Last },
  { name: "10 · Le blocus paie", from: "dec5Fin", Component: V5Final },
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
  { sound: "sparkle", at: 0.05, volume: 0.45, name: "Jeton" },
  {
    sound: "shatter",
    at: cuePartAt("dec5", 2),
    volume: 0.6,
    name: "Disparaît",
  },
  { sound: "chest", at: cueAt("bloque") + 0.1, volume: 0.5, name: "Cadenas" },
  {
    sound: "tick",
    at: cuePartAt("maison", 1) + 0.1,
    volume: 0.4,
    name: "Console",
  },
  {
    sound: "chest",
    at: cuePartAt("midi", 1) - 0.1,
    volume: 0.45,
    name: "Coffre midi",
  },
  {
    sound: "chest",
    at: cuePartAt("seize", 1) - 0.1,
    volume: 0.45,
    name: "Coffre 16 h",
  },
  {
    sound: "chest",
    at: cuePartAt("vingtDeux", 1) - 0.1,
    volume: 0.45,
    name: "Coffre 22 h",
  },
  {
    sound: "chest",
    at: cueAt("dernier") + 0.3,
    volume: 0.6,
    name: "Dernier coffre",
  },
  {
    sound: "sparkle",
    at: cuePartAt("estLa", 1),
    volume: 0.6,
    name: "Il est là",
  },
  {
    sound: "sparkle",
    at: cuePartAt("sauf", 1),
    volume: 0.6,
    name: "Le blocus paie",
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
