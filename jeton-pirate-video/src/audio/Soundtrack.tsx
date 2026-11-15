/**
 * Bande-son câblée sur le conducteur de la vidéo.
 *
 * - Voix off : montée à 0 s si le fichier existe.
 * - Musique (facultative) : morceau monté sur le récit et déjà compressé par
 *   la voix (scripts/build-music.mjs). Elle remplace la nappe de synthèse.
 * - Nappe de synthèse (bed.mp3) : utilisée seulement sans musique.
 * - Bruitages ponctuels : impacts sur les mots-chocs, souffles aux changements
 *   de scène, et bruitages propres à chaque vidéo (voir hitsV1.ts, v2/).
 */
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { useAssetAvailable } from "../lib/assets";
import { toFrames } from "../lib/timelineTools";
import type { Cue } from "../lib/timelineTools";

export const effectFiles = {
  boom: "audio/boom.wav",
  whoosh: "audio/whoosh.wav",
  sparkle: "audio/sparkle.wav",
  shatter: "audio/shatter.wav",
  buzz: "audio/buzz.wav",
  chest: "audio/chest.wav",
  tick: "audio/tick.wav",
} as const;

type EffectKey = keyof typeof effectFiles;

export type Hit = {
  sound: EffectKey;
  at: number;
  volume: number;
  name: string;
};

/** Pistes longues d'une vidéo (fichiers de /public, tous facultatifs). */
export type Tracks = { voice: string; music: string; bed: string };

/** Tous les fichiers à vérifier avant le rendu. */
export const soundFilesOf = (tracks: Tracks): string[] => [
  tracks.voice,
  tracks.music,
  tracks.bed,
  ...Object.values(effectFiles),
];

/** Un impact grave sous chaque mot-choc. */
export const impactHits = (cues: Cue[]): Hit[] =>
  cues.flatMap((cue) => {
    const part = cue.parts.find((p) => p.kind === "impact");
    return part
      ? [
          {
            sound: "boom" as const,
            at: cue.at + (part.delay ?? 0),
            volume: 0.55,
            name: `Impact ${cue.id}`,
          },
        ]
      : [];
  });

/** Un souffle à chaque changement de scène. */
export const transitionHits = (sceneStarts: number[]): Hit[] =>
  sceneStarts.slice(1).map((at, i) => ({
    sound: "whoosh" as const,
    at: at - 0.12,
    volume: 0.22,
    name: `Transition ${i + 2}`,
  }));

/**
 * Mixage. Les niveaux laissent de la marge : le volume final est normalisé
 * à l'export (-14 LUFS, standard des réseaux sociaux).
 */
const MIX = {
  withMusic: { voice: 0.8, music: 0.8, bed: 0, effects: 0.45 },
  withVoice: { voice: 0.95, music: 0, bed: 0.4, effects: 0.7 },
  withoutVoice: { voice: 0, music: 0, bed: 0.85, effects: 1 },
} as const;

const OneShot: React.FC<{ hit: Hit; gain: number }> = ({ hit, gain }) => {
  const available = useAssetAvailable(effectFiles[hit.sound]);
  if (!available || hit.at < 0) {
    return null;
  }
  return (
    <Sequence
      from={toFrames(hit.at)}
      name={hit.name}
      durationInFrames={toFrames(3)}
    >
      <Audio
        src={staticFile(effectFiles[hit.sound])}
        volume={hit.volume * gain}
      />
    </Sequence>
  );
};

export const Soundtrack: React.FC<{ tracks: Tracks; hits: Hit[] }> = ({
  tracks,
  hits,
}) => {
  const hasVoice = useAssetAvailable(tracks.voice);
  const hasBed = useAssetAvailable(tracks.bed);
  const hasMusic = useAssetAvailable(tracks.music);
  const mix = hasVoice
    ? hasMusic
      ? MIX.withMusic
      : MIX.withVoice
    : MIX.withoutVoice;
  return (
    <>
      {hasMusic && mix.music > 0 ? (
        <Audio src={staticFile(tracks.music)} volume={mix.music} />
      ) : null}
      {hasBed && mix.bed > 0 ? (
        <Audio src={staticFile(tracks.bed)} volume={mix.bed} />
      ) : null}
      {hasVoice ? (
        <Audio src={staticFile(tracks.voice)} volume={mix.voice} />
      ) : null}
      {hits.map((hit) => (
        <OneShot key={`${hit.name}-${hit.at}`} hit={hit} gain={mix.effects} />
      ))}
    </>
  );
};
