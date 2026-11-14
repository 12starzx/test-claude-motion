/**
 * Monte la musique sur le récit et la fait s'effacer sous la voix off.
 *
 * Le morceau (phonk instrumental fourni par l'utilisateur) n'est pas versionné
 * dans le dépôt : ses droits appartiennent à son auteur.
 *
 * Montage en deux segments, calés sur les repères mesurés dans le morceau :
 * - segment A : premier drop sur « DISPARAÎT. », accalmie sous « Il y en a un
 *   qui ne répondra pas », montée puis second drop sur « 137 500 COFFRES. »,
 *   puis fin naturelle du morceau (silence sous « Le jeton, NON. ») ;
 * - segment B : reprise de l'accalmie sous le compte à rebours, montée sur
 *   « Le 4 décembre… Un coffre brille », second drop sur « LE JETON EST LÀ. ».
 *
 * La musique est ensuite compressée par la voix (sidechain) : elle s'efface
 * quand la voix parle et revient entre les phrases.
 *
 * Usage : node scripts/build-music.mjs morceau.mp4 public/audio/voix-off.mp3 public/audio/musique.mp3
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [, , track, voice, output] = process.argv;
if (!track || !voice || !output) {
  console.error(
    "Usage : node scripts/build-music.mjs morceau.mp4 voix-off.mp3 musique.mp3",
  );
  process.exit(1);
}

/* Repères mesurés dans le morceau (secondes) --------------------------- */
const TRACK = {
  drop1: 16.68, // entrée du premier drop
  breakdown: 30.03, // début de l'accalmie
  drop2: 46.88, // entrée du second drop
  end: 67.0, // fin du morceau (au-delà : jingle TikTok)
};

/* Repères du récit, lus dans le conducteur ----------------------------- */
const timeline = readFileSync(join(ROOT, "src", "timeline.ts"), "utf8");
const at = (id) => {
  const m = timeline.match(new RegExp(`id: "${id}",\\s*at: ([\\d.]+)`));
  if (!m) throw new Error(`Réplique absente du conducteur : ${id}`);
  return Number(m[1]);
};
const total = Number(timeline.match(/TOTAL_SECONDS = ([\d.]+)/)[1]);
const hook = at("disparait"); // premier drop
const climax = at("estLa"); // second drop final

const aStart = TRACK.drop1 - hook;
if (aStart < 0)
  throw new Error("Le premier drop tombe trop tôt dans la vidéo.");
const aLength = TRACK.end - aStart;
const bOffset = climax - TRACK.drop2; // vidéo = morceau + bOffset
const bVideoStart = TRACK.breakdown + bOffset;
const bLength = total - bVideoStart;
if (bVideoStart < aLength - 0.5) {
  throw new Error("Les deux segments se chevauchent : revoir les repères.");
}

const r3 = (v) => v.toFixed(3);
const filter = [
  `[0:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=start=${r3(aStart)}:end=${r3(TRACK.end)},asetpts=PTS-STARTPTS,afade=t=out:st=${r3(aLength - 0.4)}:d=0.4[a]`,
  `[0:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=start=${r3(TRACK.breakdown)}:end=${r3(TRACK.breakdown + bLength)},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st=${r3(bLength - 1.6)}:d=1.6,adelay=${Math.round(bVideoStart * 1000)}:all=1[b]`,
  `[a][b]amix=inputs=2:normalize=0:duration=longest,volume=0.5[m]`,
  `[1:a]aformat=sample_rates=44100:channel_layouts=stereo,apad[v]`,
  `[m][v]sidechaincompress=threshold=0.05:ratio=5:attack=5:release=250:makeup=1[out]`,
].join(";");

const r = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-i",
    track,
    "-i",
    voice,
    "-filter_complex",
    filter,
    "-map",
    "[out]",
    "-t",
    String(total),
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "256k",
    output,
  ],
  { stdio: "inherit" },
);
if (r.status !== 0) process.exit(r.status ?? 1);

console.log(
  `✓ ${output} · segment A : morceau ${r3(aStart)} → ${r3(TRACK.end)} s (vidéo 0 → ${r3(aLength)} s) · ` +
    `segment B : morceau ${r3(TRACK.breakdown)} s à partir de la vidéo ${r3(bVideoStart)} s · ` +
    `drops sur ${hook} s et ${climax} s`,
);
