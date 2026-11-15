/**
 * Monte un morceau sur le récit et le fait s'effacer sous la voix off.
 *
 * Les morceaux (phonk instrumentaux fournis par l'utilisateur) ne sont pas
 * versionnés : leurs droits appartiennent à leurs auteurs.
 *
 * Chaque « plan » découpe le morceau en segments, placés pour que ses temps
 * forts (drops, frappes) tombent sur les phrases fortes de la voix. Les
 * instants du récit sont lus dans le conducteur : après un recalage, il
 * suffit de relancer le script.
 *
 * La musique est ensuite compressée par la voix (sidechain) : elle s'efface
 * quand la voix parle et revient entre les phrases.
 *
 * Usage :
 *   node scripts/build-music.mjs <plan> morceau.mp4 voix-off.mp3 musique.mp3
 *   plans : nowfunk (version retenue), moutses
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [, , planName, track, voice, output] = process.argv;
if (!planName || !track || !voice || !output) {
  console.error(
    "Usage : node scripts/build-music.mjs <nowfunk|moutses> morceau.mp4 voix-off.mp3 musique.mp3",
  );
  process.exit(1);
}

/* Conducteur ----------------------------------------------------------- */
// Conducteur : src/timeline.ts par défaut, ou TIMELINE=chemin.
const timeline = readFileSync(
  process.env.TIMELINE
    ? resolve(process.env.TIMELINE)
    : join(ROOT, "src", "timeline.ts"),
  "utf8",
);
const cue = (id) => {
  const m = timeline.match(
    new RegExp(
      `id: "${id}",\\s*at: ([\\d.]+),(?:\\s*end: [\\d.]+,)?\\s*parts: \\[([^\\]]*)\\]`,
    ),
  );
  if (!m) throw new Error(`Réplique absente du conducteur : ${id}`);
  const delays = [...m[2].matchAll(/\("[^"]*"(?:, ([\d.]+))?\)/g)].map((d) =>
    Number(d[1] ?? 0),
  );
  return { at: Number(m[1]), delays };
};
/** Instant d'une ligne de réplique (ex. le mot-choc, index 1). */
const at = (id, part = 0) => {
  const c = cue(id);
  return c.at + (c.delays[part] ?? 0);
};
const total = Number(timeline.match(/TOTAL_SECONDS = ([\d.]+)/)[1]);
/** Fin explicite d'une réplique (« end »). */
const cueEndOf = (id) => {
  const m = timeline.match(
    new RegExp(`id: "${id}",\\s*at: [\\d.]+,\\s*end: ([\\d.]+),`),
  );
  if (!m) throw new Error(`Réplique sans fin explicite : ${id}`);
  return Number(m[1]);
};

/**
 * Segment : `from` → `to` dans le morceau, placé à `offset`
 * (vidéo = morceau + offset), avec fondus d'entrée et de sortie (s).
 */
const seg = (from, to, offset, fadeIn = 0.03, fadeOut = 0.05) => ({
  from,
  to,
  offset,
  fadeIn,
  fadeOut,
});

/* Plans ----------------------------------------------------------------- */
const plans = {
  /**
   * @nowfunk : intro, drop à 21,75 s, plateau, frappe finale à 45,05 s,
   * fin à 46,5 s (au-delà : silence puis jingle TikTok). Tempo ≈ 105,45 BPM.
   */
  nowfunk: () => {
    const T = { drop: 21.75, hit: 45.05, end: 46.5, beat: 60 / 105.45 };
    // A : drop sur « DISPARAÎT. », frappe finale sur « EN SERVICE. ».
    const oa = (at("disparait") - T.drop + (at("service", 1) - T.hit)) / 2;
    // B : intro sous « Tu te couches », drop sur « 137 500 », frappe sur « Deux semaines. ».
    const ob = at("total") - T.drop;
    // C : intro sous le compte à rebours, drop sur « LE JETON EST LÀ. ».
    const oc = at("estLa") - T.drop;
    // D : frappe finale sur le dernier « ABANDONNÉ. », raccord calé sur les temps.
    const beats = Math.round((at("pasAbandonne", 1) - T.hit - oc) / T.beat);
    const od = oc + beats * T.beat;
    const bStart = T.hit + 0.6 + oa + 0.4; // juste après la frappe de A
    const cStart = at("rien") + 0.4; // silence sur « RIEN. »
    const dStart = at("dec5Fin"); // raccord pendant le plateau
    return [
      seg(-oa, T.end, oa, 0.03, 0.4),
      seg(bStart - ob, T.end, ob, 0.4, 0.4),
      seg(cStart - oc, dStart - oc + 0.25, oc, 0.5, 0.25),
      seg(dStart - od, T.end, od, 0.25, 0.4),
    ];
  },
  /**
   * Vidéo 2 (« la mission ») avec le morceau @nowfunk : drop sur « POUR
   * TOUJOURS. », frappe sur les munitions, silence sur « UN POISSON. », drop
   * sur « JAMAIS. », calme pour le dernier soir, drop sur « IL EST LÀ. »,
   * frappe finale sur « CASIER. ».
   */
  nowfunk2: () => {
    const T = { drop: 21.75, hit: 45.05, end: 46.5, beat: 60 / 105.45 };
    const oa = (at("toujours") - T.drop + (at("soir2", 1) - T.hit)) / 2;
    const ob = at("jamais", 1) - T.drop;
    const oc = at("estLa") - T.drop;
    const beats = Math.round((at("casier", 2) - T.hit - oc) / T.beat);
    const od = oc + beats * T.beat;
    const bStart = cueEndOf("poisson") - 0.1; // silence sur « UN POISSON. »
    const bEnd = at("dec4"); // calme pour le dernier soir
    const cStart = at("dec4");
    const dStart = at("dec5Fin"); // raccord pendant le plateau
    return [
      seg(-oa, T.end, oa, 0.03, 0.4),
      seg(bStart - ob, bEnd - ob + 0.3, ob, 0.3, 0.3),
      seg(cStart - oc, dStart - oc + 0.25, oc, 0.5, 0.25),
      seg(dStart - od, T.end, od, 0.25, 0.4),
    ];
  },
  /**
   * Vidéo 3 (« ceux qui restent ») avec le morceau @nowfunk : intro sous
   * l'abandon, drop sur « CEUX QUI RESTENT. », silence sous le futur sombre,
   * drop sur « IL EST LÀ. », frappe finale sur « LE GAGNENT. », puis silence
   * pour la question finale.
   */
  nowfunk3: () => {
    const T = { drop: 21.75, hit: 45.05, end: 46.5, beat: 60 / 105.45 };
    const oa = at("restent", 1) - T.drop;
    const ob = at("estLa", 1) - T.drop;
    const beats = Math.round((at("gagnent", 1) - T.hit - ob) / T.beat);
    const od = ob + beats * T.beat;
    const aEnd = at("imagine"); // silence sous le futur sombre
    const bStart = at("ouAlors");
    const dStart = at("rappelle"); // raccord pendant le plateau
    return [
      seg(-oa, aEnd - oa + 0.6, oa, 0.03, 0.6),
      seg(bStart - ob, dStart - ob + 0.25, ob, 0.6, 0.25),
      seg(dStart - od, T.end, od, 0.25, 0.4),
    ];
  },
  /**
   * Vidéo 4 (« GTA 6 : treize ans ») avec le morceau @nowfunk : drop sur
   * « TU ATTENDS TOUJOURS. », calme sous « Rockstar préfère attendre », drop
   * sur « DEUX REPORTS. », silence pour « Et toi… », montée pendant la leçon,
   * drop sur « JEUDI 19 NOVEMBRE. », frappe finale sur « QUELQUES JOURS. ».
   */
  nowfunk4: () => {
    const T = { drop: 21.75, hit: 45.05, end: 46.5, beat: 60 / 105.45 };
    const oa = at("attends") - T.drop;
    const ob = at("deuxReports") - T.drop;
    const oc = at("jeudi") - T.drop;
    const beats = Math.round((at("jours", 1) - T.hit - oc) / T.beat);
    const od = oc + beats * T.beat;
    const bStart = at("rockstar");
    const bEnd = at("etToi") - 0.1; // silence pour « Et toi… »
    const cStart = at("lecon");
    const dStart = at("jason"); // raccord pendant le plateau
    return [
      seg(-oa, bStart - oa + 0.4, oa, 0.03, 0.4),
      seg(bStart - ob, bEnd - ob + 0.5, ob, 0.4, 0.5),
      seg(cStart - oc, dStart - oc + 0.25, oc, 0.6, 0.25),
      seg(dStart - od, T.end, od, 0.25, 0.4),
    ];
  },
  /** @moutses : drops à 16,68 s et 46,88 s, accalmie à 30,03 s, fin à 67 s. */
  moutses: () => {
    const T = { drop1: 16.68, breakdown: 30.03, drop2: 46.88, end: 67.0 };
    const oa = at("disparait") - T.drop1;
    const ob = at("estLa") - T.drop2;
    return [
      seg(-oa, T.end, oa, 0.03, 0.4),
      seg(T.breakdown, total - ob, ob, 0.04, 1.6),
    ];
  },
};

/** Niveau d'entrée de chaque morceau (le n° 1 est mixé moins fort à l'origine). */
const GAIN = {
  nowfunk: 0.85,
  nowfunk2: 0.85,
  nowfunk3: 0.85,
  nowfunk4: 0.85,
  moutses: 0.5,
};

const plan = plans[planName];
if (!plan) throw new Error(`Plan inconnu : ${planName}`);
const segments = plan().filter(
  (s) => s.to > s.from && s.from + s.offset < total,
);

/* Montage + effacement sous la voix ------------------------------------ */
const r3 = (v) => Math.max(0, v).toFixed(3);
const chains = segments.map((s, i) => {
  const len = s.to - s.from;
  const delay = Math.round((s.from + s.offset) * 1000);
  return (
    `[0:a]aformat=sample_rates=44100:channel_layouts=stereo,` +
    `atrim=start=${r3(s.from)}:end=${r3(s.to)},asetpts=PTS-STARTPTS,` +
    `afade=t=in:d=${s.fadeIn},afade=t=out:st=${r3(len - s.fadeOut)}:d=${s.fadeOut},` +
    `adelay=${delay}:all=1[s${i}]`
  );
});
const filter = [
  ...chains,
  `${segments.map((_, i) => `[s${i}]`).join("")}amix=inputs=${segments.length}:normalize=0:duration=longest,volume=${GAIN[planName]}[m]`,
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

console.log(`✓ ${output} (plan « ${planName} »)`);
segments.forEach((s, i) =>
  console.log(
    `  segment ${String.fromCharCode(65 + i)} : morceau ${s.from.toFixed(2)} → ${s.to.toFixed(2)} s, ` +
      `vidéo ${(s.from + s.offset).toFixed(2)} → ${(s.to + s.offset).toFixed(2)} s`,
  ),
);
