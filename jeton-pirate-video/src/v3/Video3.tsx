/**
 * Montage de la vidéo 3 (« ceux qui restent ») : même fond, mêmes sous-titres et
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
  V3Choice,
  V3Closer,
  V3Dark,
  V3Deadline,
  V3Doubt,
  V3Found,
  V3LastNight,
  V3Leave,
  V3Relaunch,
  V3Return,
  V3Reward,
  V3Team,
  V3Timer,
} from "./scenes";
import { cues, timeline3 } from "./timeline";

export const tracksV3: Tracks = {
  voice: "audio/voix-off-3.mp3",
  music: "audio/musique-3.mp3",
  bed: "audio/bed.mp3",
};

const SCENES: { name: string; from: string | null; Component: React.FC }[] = [
  { name: "01 · Abandonné", from: null, Component: V3Leave },
  { name: "02 · C'est de la chance", from: "dit", Component: V3Doubt },
  { name: "03 · Ceux qui restent", from: "ecoute", Component: V3Reward },
  { name: "04 · Tu peux revenir", from: "lachent", Component: V3Return },
  { name: "05 · Tu te rapproches", from: "chaqueSoir", Component: V3Closer },
  { name: "06 · 30 minutes", from: "nuit", Component: V3Timer },
  { name: "07 · Toute l'équipe", from: "unSeul", Component: V3Team },
  { name: "08 · Tu regardes", from: "imagine", Component: V3Dark },
  { name: "09 · L'autre version", from: "ouAlors", Component: V3LastNight },
  { name: "10 · Il est là", from: "unDePlus", Component: V3Found },
  { name: "11 · Relance le jeu", from: "relance", Component: V3Relaunch },
  { name: "12 · N'attend personne", from: "attendPas", Component: V3Deadline },
  { name: "13 · Tu choisis quoi ?", from: "regardent", Component: V3Choice },
];

const LEAD = 0.06;
const sceneStarts = (): number[] =>
  SCENES.map((s) =>
    s.from === null ? 0 : Math.max(0, timeline3.cueAt(s.from) - LEAD),
  );

const { cueAt, cuePartAt } = timeline3;

const hitsV3 = (starts: number[]): Hit[] => [
  ...impactHits(cues),
  ...transitionHits(starts),
  {
    sound: "sparkle",
    at: cuePartAt("restent", 1),
    volume: 0.5,
    name: "Ceux qui restent",
  },
  {
    sound: "sparkle",
    at: cuePartAt("touteEquipe", 1),
    volume: 0.45,
    name: "Jeton partagé",
  },
  {
    sound: "shatter",
    at: cueAt("disparait"),
    volume: 0.5,
    name: "Le jeton disparaît",
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    sound: "tick" as const,
    at: cueAt("dec4") + 0.15 + i * 0.15,
    volume: 0.22,
    name: `Horloge ${i + 1}`,
  })),
  {
    sound: "chest",
    at: cueAt("ouvres") + 0.1,
    volume: 0.7,
    name: "Le coffre s'ouvre",
  },
  {
    sound: "sparkle",
    at: cuePartAt("estLa", 1),
    volume: 0.6,
    name: "Il est là",
  },
  { sound: "tick", at: cueAt("relance") + 0.2, volume: 0.5, name: "Jouer" },
  {
    sound: "buzz",
    at: cueAt("rappelle"),
    volume: 0.4,
    name: "Appel de l'équipe",
  },
  {
    sound: "sparkle",
    at: cuePartAt("choisis", 1),
    volume: 0.5,
    name: "Le choix",
  },
];

const FadeOut: React.FC = () => {
  const t = useCurrentFrame() / VIDEO.fps;
  const p = clamp01((t - (timeline3.total - 1.1)) / 1);
  return p > 0 ? (
    <AbsoluteFill style={{ background: "#000", opacity: p }} />
  ) : null;
};

export const JetonVideo3: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AssetGate files={soundFilesOf(tracksV3)}>
      <TimelineProvider value={timeline3}>
        <AbsoluteFill style={{ background: "#000" }}>
          <SvgDefs />
          <Backdrop />
          {SCENES.map((scene, i) => {
            const start = starts[i];
            const end =
              i + 1 < SCENES.length
                ? starts[i + 1] + TRANSITION
                : timeline3.total;
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
          <Soundtrack tracks={tracksV3} hits={hitsV3(starts)} />
        </AbsoluteFill>
      </TimelineProvider>
    </AssetGate>
  );
};
