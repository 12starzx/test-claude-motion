/**
 * Montage : fond permanent, 23 scènes en fondu enchaîné, sous-titres,
 * finitions et bande-son.
 */
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Soundtrack, soundFiles } from "./audio/Soundtrack";
import { Backdrop, Finish } from "./components/Backdrop";
import { Captions } from "./components/Captions";
import { SvgDefs } from "./components/art/Defs";
import { AssetGate } from "./lib/assets";
import { clamp01 } from "./lib/anim";
import { SceneProvider, SceneShell, TRANSITION } from "./lib/scene";
import {
  SceneController,
  SceneMates,
  SceneOpening,
  SceneSleeper,
  SceneSquad,
} from "./scenes/Act1";
import {
  SceneBed,
  SceneConveyor,
  SceneGauge,
  SceneService,
  SceneTotal,
  SceneWeeks,
} from "./scenes/Act2";
import {
  SceneCountdown,
  SceneDays,
  SceneDinner,
  SceneExam,
  ScenePlanner,
  SceneTeam,
} from "./scenes/Act3";
import {
  SceneClock,
  SceneFinalDay,
  SceneFinale,
  SceneOnline,
  SceneReveal,
  SceneShore,
} from "./scenes/Act4";
import { cueAt, TOTAL_SECONDS, toFrames } from "./timeline";
import { VIDEO } from "./theme";

/** Chaque scène démarre sur une réplique du conducteur (null = début). */
export const SCENES: {
  name: string;
  from: string | null;
  Component: React.FC;
}[] = [
  { name: "01 · Le jeton disparaît", from: null, Component: SceneOpening },
  {
    name: "02 · Reprends ta manette",
    from: "etToi",
    Component: SceneController,
  },
  { name: "03 · Rappelle-les", from: "potes", Component: SceneMates },
  { name: "04 · Toute l'équipe l'a", from: "unSeul", Component: SceneSquad },
  {
    name: "05 · Celui qui ne répond pas",
    from: "ilYenA",
    Component: SceneSleeper,
  },
  { name: "06 · Trois semaines", from: "probleme1", Component: SceneWeeks },
  { name: "07 · En service", from: "joues", Component: SceneService },
  { name: "08 · Nuit et jour", from: "couches", Component: SceneBed },
  { name: "09 · Les coffres", from: "entreDeux", Component: SceneConveyor },
  { name: "10 · 137 500 coffres", from: "total", Component: SceneTotal },
  { name: "11 · Fais mieux", from: "quarante", Component: SceneGauge },
  { name: "12 · À table", from: "mere", Component: SceneDinner },
  { name: "13 · Le contrôle", from: "prof", Component: ScenePlanner },
  { name: "14 · Le bac, le jeton", from: "bienSur", Component: SceneExam },
  { name: "15 · Les jours filent", from: "probleme2", Component: SceneDays },
  {
    name: "16 · Toujours rien",
    from: "deuxSemaines",
    Component: SceneCountdown,
  },
  { name: "17 · L'équipe", from: "personne", Component: SceneTeam },
  { name: "18 · 23 heures", from: "dec4", Component: SceneClock },
  { name: "19 · Tous connectés", from: "touteEquipe", Component: SceneOnline },
  {
    name: "20 · Au bord de l'eau",
    from: "coffreBrille",
    Component: SceneShore,
  },
  { name: "21 · Le jeton est là", from: "estLa", Component: SceneReveal },
  { name: "22 · Le 5 décembre", from: "dec5Fin", Component: SceneFinalDay },
  { name: "23 · Pas abandonné", from: "saufCeux", Component: SceneFinale },
];

/** Les images arrivent un poil avant la réplique, comme dans l'original. */
const LEAD = 0.06;

export const sceneStarts = (): number[] =>
  SCENES.map((s) => (s.from === null ? 0 : Math.max(0, cueAt(s.from) - LEAD)));

/** Fondu au noir final. */
const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  const p = clamp01((t - (TOTAL_SECONDS - 1.1)) / 1);
  return p > 0 ? (
    <AbsoluteFill style={{ background: "#000", opacity: p }} />
  ) : null;
};

export const JetonVideo: React.FC = () => {
  const starts = sceneStarts();
  return (
    <AssetGate files={Object.values(soundFiles)}>
      <AbsoluteFill style={{ background: "#000" }}>
        <SvgDefs />
        <Backdrop />
        {SCENES.map((scene, i) => {
          const start = starts[i];
          const end =
            i + 1 < SCENES.length ? starts[i + 1] + TRANSITION : TOTAL_SECONDS;
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
        <Soundtrack sceneStarts={starts} />
      </AbsoluteFill>
    </AssetGate>
  );
};
