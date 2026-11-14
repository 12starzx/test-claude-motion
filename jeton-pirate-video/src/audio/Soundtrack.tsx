/**
 * Bande-son câblée sur le conducteur.
 *
 * - Nappe musicale (bed.mp3) : arrangée sur les temps forts, générée par
 *   scripts/generate-sound-design.mjs.
 * - Bruitages ponctuels : impacts sur les mots-chocs, souffles aux changements
 *   de scène, scintillements du jeton, coffres, téléphone, horloge.
 * - Voix off (voix-off.mp3) : montée à 0 s si le fichier existe ; la nappe
 *   est alors baissée pour laisser la voix devant.
 * - Musique (musique.mp3, facultative) : morceau monté sur le récit et déjà
 *   compressé par la voix (scripts/build-music.mjs). Elle remplace alors la
 *   nappe de synthèse, et les bruitages passent en retrait.
 */
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { useAssetAvailable } from "../lib/assets";
import { cueAt, cuePartAt, cues, toFrames } from "../timeline";

export const soundFiles = {
  voice: "audio/voix-off.mp3",
  music: "audio/musique.mp3",
  bed: "audio/bed.mp3",
  boom: "audio/boom.wav",
  whoosh: "audio/whoosh.wav",
  sparkle: "audio/sparkle.wav",
  shatter: "audio/shatter.wav",
  buzz: "audio/buzz.wav",
  chest: "audio/chest.wav",
  tick: "audio/tick.wav",
} as const;

type SoundKey = keyof typeof soundFiles;

type Hit = { sound: SoundKey; at: number; volume: number; name: string };

const impacts = (): Hit[] =>
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

const hits = (sceneStarts: number[]): Hit[] => [
  ...impacts(),
  ...sceneStarts.slice(1).map((at, i) => ({
    sound: "whoosh" as const,
    at: at - 0.12,
    volume: 0.22,
    name: `Transition ${i + 2}`,
  })),
  // Le jeton
  { sound: "sparkle", at: 0.05, volume: 0.5, name: "Jeton : apparition" },
  {
    sound: "shatter",
    at: cueAt("disparait"),
    volume: 0.7,
    name: "Jeton : disparaît",
  },
  {
    sound: "sparkle",
    at: cueAt("trouve") + 0.1,
    volume: 0.45,
    name: "Jeton trouvé",
  },
  {
    sound: "sparkle",
    at: cueAt("toute") + 0.1,
    volume: 0.45,
    name: "Jeton partagé",
  },
  {
    sound: "sparkle",
    at: cueAt("peutEtre") + 0.2,
    volume: 0.35,
    name: "Rêve du jeton",
  },
  { sound: "sparkle", at: cueAt("pensant1"), volume: 0.3, name: "Pensée" },
  {
    sound: "sparkle",
    at: cueAt("non") + 0.05,
    volume: 0.4,
    name: "Jeton : non",
  },
  {
    sound: "shatter",
    at: cuePartAt("non", 1),
    volume: 0.6,
    name: "Jeton : brisé",
  },
  {
    sound: "sparkle",
    at: cueAt("estLa"),
    volume: 0.6,
    name: "Le jeton est là",
  },
  {
    sound: "sparkle",
    at: cuePartAt("pasAbandonne", 1),
    volume: 0.6,
    name: "Jetons de l'équipe",
  },
  // Téléphone
  { sound: "buzz", at: cueAt("repondra"), volume: 0.5, name: "Appel 1" },
  { sound: "buzz", at: cueAt("insiste"), volume: 0.6, name: "Appel insistant" },
  {
    sound: "buzz",
    at: cueAt("insiste") + 0.45,
    volume: 0.6,
    name: "Appel insistant 2",
  },
  {
    sound: "buzz",
    at: cueAt("rappelle"),
    volume: 0.35,
    name: "Rappel des potes",
  },
  // Coffres
  { sound: "chest", at: cueAt("rien"), volume: 0.6, name: "Coffre vide" },
  {
    sound: "chest",
    at: cueAt("bandage") - 0.05,
    volume: 0.6,
    name: "Coffre : bandage",
  },
  {
    sound: "chest",
    at: cueAt("toujoursRien") + 0.05,
    volume: 0.6,
    name: "Coffre vide 2",
  },
  {
    sound: "chest",
    at: cueAt("ouvres") + 0.15,
    volume: 0.7,
    name: "Le coffre s'ouvre",
  },
  // Horloge et minuteur
  ...Array.from({ length: 10 }, (_, i) => ({
    sound: "tick" as const,
    at: cueAt("dec4") + 0.15 + i * 0.13,
    volume: 0.25,
    name: `Horloge ${i + 1}`,
  })),
  { sound: "tick", at: cuePartAt("minutes", 1), volume: 0.4, name: "Minuteur" },
];

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
  const available = useAssetAvailable(soundFiles[hit.sound]);
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
        src={staticFile(soundFiles[hit.sound])}
        volume={hit.volume * gain}
      />
    </Sequence>
  );
};

export const Soundtrack: React.FC<{ sceneStarts: number[] }> = ({
  sceneStarts,
}) => {
  const hasVoice = useAssetAvailable(soundFiles.voice);
  const hasBed = useAssetAvailable(soundFiles.bed);
  const hasMusic = useAssetAvailable(soundFiles.music);
  const mix = hasVoice
    ? hasMusic
      ? MIX.withMusic
      : MIX.withVoice
    : MIX.withoutVoice;
  return (
    <>
      {hasMusic && mix.music > 0 ? (
        <Audio src={staticFile(soundFiles.music)} volume={mix.music} />
      ) : null}
      {hasBed && mix.bed > 0 ? (
        <Audio src={staticFile(soundFiles.bed)} volume={mix.bed} />
      ) : null}
      {hasVoice ? (
        <Audio src={staticFile(soundFiles.voice)} volume={mix.voice} />
      ) : null}
      {hits(sceneStarts).map((hit) => (
        <OneShot key={`${hit.name}-${hit.at}`} hit={hit} gain={mix.effects} />
      ))}
    </>
  );
};
