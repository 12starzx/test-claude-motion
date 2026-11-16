/**
 * Montage de la vidéo 6 (« la chance ») : même fond, mêmes sous-titres et
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
  V6Answer,
  V6Cards,
  V6Chests,
  V6Clocks,
  V6Gone,
  V6Luck,
  V6Map,
  V6Nights,
  V6Phone,
  V6Third,
} from "./scenes";
import { cues, timeline6 } from "./timeline";

export const tracksV6: Tracks = {
  voice: "audio/voix-off-6.mp3",
  music: "audio/musique-6.mp3",
  bed: "audio/bed.mp3",
};

const SCENES: { name: string; from: string | null; Component: React.FC }[] = [
  { name: "01 · Les deux cartes", from: null, Component: V6Cards },
  { name: "02 · Il disparaît", from: "dec5", Component: V6Gone },
  { name: "03 · La chance ? Faux", from: "demande", Component: V6Luck },
  { name: "04 · 2 h 01", from: "joue", Component: V6Clocks },
  { name: "05 · 301 coffres", from: "coffres", Component: V6Chests },
  { name: "06 · Le sud, puis le nord", from: "nord", Component: V6Map },
  { name: "07 · Rien", from: "soir1", Component: V6Nights },
  { name: "08 · Tu relances", from: "capture", Component: V6Phone },
  { name: "09 · 1 h 12", from: "soir3", Component: V6Third },
  { name: "10 · La chance", from: "lendemain", Component: V6Answer },
];

const LEAD = 0.06;
const sceneStarts = (): number[] =>
  SCENES.map((s) =>
    s.from === null ? 0 : Math.max(0, timeline6.cueAt(s.from) - LEAD),
  );

const { cueAt, cuePartAt } = timeline6;

const hitsV6 = (starts: number[]): Hit[] => [
  ...impactHits(cues),
  ...transitionHits(starts),
  { sound: "sparkle", at: 0.05, volume: 0.45, name: "Jeton du pote" },
  {
    sound: "shatter",
    at: cuePartAt("dec5", 1),
    volume: 0.6,
    name: "Disparaît",
  },
  { sound: "tick", at: cuePartAt("toi1", 1), volume: 0.5, name: "02:01" },
  { sound: "chest", at: cuePartAt("toi2", 1) - 0.1, volume: 0.5, name: "301" },
  {
    sound: "chest",
    at: cuePartAt("soir1", 1) - 0.1,
    volume: 0.45,
    name: "Coffre vide 1",
  },
  {
    sound: "chest",
    at: cuePartAt("soir2", 1) - 0.1,
    volume: 0.45,
    name: "Coffre vide 2",
  },
  { sound: "buzz", at: cueAt("capture") + 0.25, volume: 0.5, name: "Capture" },
  {
    sound: "sparkle",
    at: cuePartAt("ferme", 1),
    volume: 0.5,
    name: "Relancer",
  },
  { sound: "tick", at: cueAt("h112"), volume: 0.45, name: "1 h 12" },
  {
    sound: "chest",
    at: cueAt("dernier") + 0.3,
    volume: 0.6,
    name: "Dernier coffre",
  },
  {
    sound: "sparkle",
    at: cuePartAt("dernier", 1),
    volume: 0.6,
    name: "Il est là",
  },
  {
    sound: "sparkle",
    at: cuePartAt("reponds", 1),
    volume: 0.6,
    name: "La chance",
  },
];

const FadeOut: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  const p = clamp01((t - (timeline6.total - 1.1)) / 1);
  return p > 0 ? (
    <AbsoluteFill style={{ background: "#000", opacity: p }} />
  ) : null;
};

export const JetonVideo6: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AssetGate files={soundFilesOf(tracksV6)}>
      <TimelineProvider value={timeline6}>
        <AbsoluteFill style={{ background: "#000" }}>
          <SvgDefs />
          <Backdrop />
          {SCENES.map((scene, i) => {
            const start = starts[i];
            const end =
              i + 1 < SCENES.length
                ? starts[i + 1] + TRANSITION
                : timeline6.total;
            const duration = end - start;
            return (
              <Sequence
                key={scene.name}
                name={scene.name}
                from={toFrames(start)}
                durationInFrames={toFrames(duration)}
              >
                <SceneProvider value={{ start, duration }}>
                  <SceneShell instant={i === 0}>
                    <scene.Component />
                  </SceneShell>
                </SceneProvider>
              </Sequence>
            );
          })}
          <Captions />
          <Finish />
          <FadeOut />
          <Soundtrack tracks={tracksV6} hits={hitsV6(starts)} />
        </AbsoluteFill>
      </TimelineProvider>
    </AssetGate>
  );
};
