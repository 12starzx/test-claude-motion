/**
 * Bande-son câblée sur la timeline.
 *
 * - Nappe ambiante discrète sur toute la durée.
 * - Scène 2 : un tick par caractère, calé sur la même table que l'affichage.
 * - Scène 3 : riser pendant le traitement.
 * - Scène 4 : whoosh + boom grave sur la révélation, puis tick UI par carte.
 * - Scène 6 : résolution douce.
 *
 * Chaque piste n'est montée que si son fichier existe (voir AssetGate).
 */
import { Audio } from "@remotion/media";
import { interpolate, random, Sequence, staticFile } from "remotion";
import { useAssetAvailable } from "../lib/assets";
import { clamp } from "../lib/motion";
import { frenchTypography } from "../lib/typography";
import { useQueryTypingSchedule } from "../scenes/Scene2Query";
import { timings } from "../theme";
import { soundFiles, soundLevels, soundTiming } from "./soundDesign";

const TICK_LENGTH = 6;

export const Soundtrack: React.FC<{ query: string; benefitCount: number }> = ({
  query,
  benefitCount,
}) => {
  const { scenes, reveal } = timings;
  const total = timings.durationInFrames;
  const schedule = useQueryTypingSchedule(query);
  const characters = Array.from(frenchTypography(query));

  const has = {
    ambient: useAssetAvailable(soundFiles.ambient),
    typeTick: useAssetAvailable(soundFiles.typeTick),
    riser: useAssetAvailable(soundFiles.riser),
    whoosh: useAssetAvailable(soundFiles.whoosh),
    boom: useAssetAvailable(soundFiles.boom),
    uiTick: useAssetAvailable(soundFiles.uiTick),
    resolve: useAssetAvailable(soundFiles.resolve),
  };

  // Ticks UI : carte principale puis chaque carte secondaire.
  const cardFrames = [
    reveal.mainCardIn,
    ...Array.from({ length: benefitCount }, (_, i) => reveal.benefitsIn + i * reveal.benefitStagger),
  ];

  return (
    <>
      {has.ambient ? (
        <Audio
          src={staticFile(soundFiles.ambient)}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, soundTiming.ambientFadeIn, total - soundTiming.ambientFadeOut, total],
              [0, soundLevels.ambient, soundLevels.ambient, 0],
              clamp,
            )
          }
        />
      ) : null}

      {has.typeTick
        ? schedule.map((at, index) =>
            characters[index] === " " ? null : (
              <Sequence
                key={`tick-${index}`}
                name={`Tick « ${characters[index]} »`}
                from={scenes.query.from + at}
                durationInFrames={TICK_LENGTH}
                layout="none"
              >
                <Audio
                  src={staticFile(soundFiles.typeTick)}
                  volume={soundLevels.typeTick * (0.7 + 0.3 * random(`tick-volume-${index}`))}
                  playbackRate={0.94 + 0.12 * random(`tick-rate-${index}`)}
                />
              </Sequence>
            ),
          )
        : null}

      {has.riser ? (
        <Sequence name="Riser" from={scenes.processing.from} durationInFrames={scenes.processing.duration} layout="none">
          <Audio
            src={staticFile(soundFiles.riser)}
            volume={(f) =>
              interpolate(
                f,
                [0, scenes.processing.duration - soundTiming.riserFadeOut, scenes.processing.duration],
                [soundLevels.riser * 0.35, soundLevels.riser, 0],
                clamp,
              )
            }
          />
        </Sequence>
      ) : null}

      {has.whoosh ? (
        <Sequence
          name="Whoosh"
          from={scenes.reveal.from - soundTiming.whooshLead}
          durationInFrames={45}
          layout="none"
        >
          <Audio src={staticFile(soundFiles.whoosh)} volume={soundLevels.whoosh} />
        </Sequence>
      ) : null}

      {has.boom ? (
        <Sequence name="Boom" from={scenes.reveal.from} durationInFrames={120} layout="none">
          <Audio src={staticFile(soundFiles.boom)} volume={soundLevels.boom} />
        </Sequence>
      ) : null}

      {has.uiTick
        ? cardFrames.map((at, index) => (
            <Sequence
              key={`ui-${index}`}
              name={`Tick carte ${index + 1}`}
              from={scenes.reveal.from + at}
              durationInFrames={10}
              layout="none"
            >
              <Audio src={staticFile(soundFiles.uiTick)} volume={soundLevels.uiTick} />
            </Sequence>
          ))
        : null}

      {has.resolve ? (
        <Sequence name="Résolution" from={scenes.outro.from} durationInFrames={scenes.outro.duration} layout="none">
          <Audio src={staticFile(soundFiles.resolve)} volume={soundLevels.resolve} />
        </Sequence>
      ) : null}
    </>
  );
};
