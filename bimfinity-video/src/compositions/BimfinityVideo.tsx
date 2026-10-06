/**
 * Film BIMfinity « le copilote en action » : montage des six scènes.
 * Partagé tel quel par les compositions 16:9 et 9:16 ; chaque scène
 * s'adapte au format via useLayout().
 *
 * Transitions :
 * - Scènes 1 → 2 → 3 → 4 : continuité. La console reste en place d'une scène
 *   à l'autre (raccord invisible) ; seuls les éléments propres à chaque scène
 *   entrent et sortent en fondu + parallaxe.
 * - Scènes 4 → 5 → 6 : fondu + parallaxe, chevauchement de ~100 ms (3 frames).
 */
import { AbsoluteFill, Sequence } from "remotion";
import { Soundtrack } from "../audio/Soundtrack";
import { soundFiles } from "../audio/soundDesign";
import { Background } from "../components/background/Background";
import { AssetGate, LOGO_FILE } from "../lib/assets";
import { Stage } from "../lib/layout";
import type { BimfinityProps } from "../schema";
import { SceneColdOpen } from "../scenes/Scene1ColdOpen";
import { SceneQuery } from "../scenes/Scene2Query";
import { SceneProcessing } from "../scenes/Scene3Processing";
import { SceneReveal } from "../scenes/Scene4Reveal";
import { SceneValue } from "../scenes/Scene5Value";
import { SceneOutro } from "../scenes/Scene6Outro";
import { colors, timings } from "../theme";

const OPTIONAL_FILES = [LOGO_FILE, ...Object.values(soundFiles)];

export const BimfinityVideo: React.FC<BimfinityProps> = (props) => {
  const { scenes, overlap } = timings;
  const valueFrom = scenes.value.from - overlap;
  const outroFrom = scenes.outro.from - overlap;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <AssetGate optionalFiles={OPTIONAL_FILES}>
        <Stage>
          <Background />

          <Sequence
            name="Scène 1 · Cold open"
            from={scenes.coldOpen.from}
            durationInFrames={scenes.coldOpen.duration}
          >
            <SceneColdOpen
              label={props.console.label}
              query={props.console.query}
            />
          </Sequence>

          <Sequence
            name="Scène 2 · La requête"
            from={scenes.query.from}
            durationInFrames={scenes.query.duration}
          >
            <SceneQuery
              label={props.console.label}
              query={props.console.query}
            />
          </Sequence>

          <Sequence
            name="Scène 3 · Le traitement"
            from={scenes.processing.from}
            durationInFrames={scenes.processing.duration}
          >
            <SceneProcessing
              label={props.console.label}
              query={props.console.query}
              sources={props.processing.sources}
              subtitle={props.processing.subtitle}
            />
          </Sequence>

          <Sequence
            name="Scène 4 · La révélation"
            from={scenes.reveal.from}
            durationInFrames={scenes.reveal.duration}
          >
            <SceneReveal
              label={props.console.label}
              query={props.console.query}
              recommendation={props.reveal.recommendation}
              benefits={props.reveal.benefits}
              duration={scenes.reveal.duration}
            />
          </Sequence>

          <Sequence
            name="Scène 5 · La valeur"
            from={valueFrom}
            durationInFrames={scenes.value.duration + overlap}
          >
            <SceneValue
              title={props.value.title}
              duration={scenes.value.duration + overlap}
            />
          </Sequence>

          <Sequence
            name="Scène 6 · Outro"
            from={outroFrom}
            durationInFrames={scenes.outro.duration + overlap}
            premountFor={30}
          >
            <SceneOutro
              brandName={props.outro.brandName}
              logoIncludesName={props.outro.logoIncludesName}
              tagline={props.outro.tagline}
              baseline={props.outro.baseline}
              poweredBy={props.outro.poweredBy}
              duration={scenes.outro.duration + overlap}
            />
          </Sequence>
        </Stage>

        <Soundtrack
          query={props.console.query}
          benefitCount={props.reveal.benefits.length}
        />
      </AssetGate>
    </AbsoluteFill>
  );
};
