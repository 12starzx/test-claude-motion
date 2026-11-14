/**
 * Estime l'horodatage mot à mot d'une voix off quand aucune transcription
 * horodatée n'est disponible.
 *
 * Principe :
 * 1. ffmpeg repère les pauses de la voix (silencedetect) : on obtient les
 *    plages de parole.
 * 2. Le texte lu (voix-off.txt) est découpé en phrases à chaque ponctuation ;
 *    la durée attendue de chaque phrase est estimée par son nombre de syllabes.
 * 3. Une programmation dynamique aligne phrases et plages de parole (une
 *    plage peut contenir plusieurs phrases ; une pause au milieu d'une phrase
 *    est tolérée mais pénalisée).
 * 4. Dans chaque plage, les mots se partagent le temps au prorata de leurs
 *    syllabes.
 *
 * Sortie : un JSON au format ElevenLabs Scribe ({ words: [{ text, start, end }] }),
 * directement utilisable par scripts/retime-from-transcript.mjs.
 *
 * Usage : node scripts/align-voice.mjs public/audio/voix-off.mp3 voix-off.txt sortie.json
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [, , audio, textFile, output] = process.argv;
if (!audio || !textFile || !output) {
  console.error(
    "Usage : node scripts/align-voice.mjs voix.mp3 texte.txt sortie.json",
  );
  process.exit(1);
}

/* Plages de parole ---------------------------------------------------- */

const ffmpeg = (args) => {
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.error) throw r.error;
  return r.stderr;
};

const probe = ffmpeg([
  "-i",
  audio,
  "-af",
  "silencedetect=noise=-38dB:d=0.12",
  "-f",
  "null",
  "-",
]);
const duration = (() => {
  const m = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
})();
const starts = [...probe.matchAll(/silence_start: ([\d.]+)/g)].map((m) =>
  Number(m[1]),
);
const ends = [...probe.matchAll(/silence_end: ([\d.]+)/g)].map((m) =>
  Number(m[1]),
);

const segments = [];
let cursor = 0;
starts.forEach((s, i) => {
  if (s > cursor + 0.05) segments.push({ start: cursor, end: s });
  cursor = ends[i] ?? duration;
});
if (cursor < duration - 0.05) segments.push({ start: cursor, end: duration });

/* Phrases et syllabes ------------------------------------------------- */

const DIGITS = { 4: "quatre", 5: "cinq", 23: "vingt trois" };
const syllables = (word) => {
  const w = (DIGITS[word] ?? word)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z ]/g, " ");
  return w
    .split(/\s+/)
    .filter(Boolean)
    .reduce((sum, part) => {
      let n = (part.match(/[aeiouy]+/g) ?? []).length;
      if (n > 1 && /(e|es|ent)$/.test(part)) n -= 1; // e muet final
      return sum + Math.max(1, n);
    }, 0);
};

const text = readFileSync(textFile, "utf8").replace(/\[[^\]]*\]/g, " ");
const phrases = text
  .split(/(?<=[.,?!…])\s+/)
  .map((p) => p.trim())
  .filter(Boolean)
  .map((p) => {
    const words = p.split(/\s+/).filter(Boolean);
    const sy = words.map(syllables);
    return { words, sy, total: sy.reduce((a, b) => a + b, 0) };
  });

const speech = segments.reduce((a, s) => a + (s.end - s.start), 0);
const totalSyl = phrases.reduce((a, p) => a + p.total, 0);
const rate = speech / totalSyl; // secondes par syllabe

/* Alignement (programmation dynamique) -------------------------------- */

const n = phrases.length;
const m = segments.length;
const INF = 1e9;
const cost = Array.from({ length: n + 1 }, () =>
  new Float64Array(m + 1).fill(INF),
);
const back = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
cost[0][0] = 0;
for (let i = 0; i <= n; i++) {
  for (let j = 0; j <= m; j++) {
    if (cost[i][j] >= INF) continue;
    for (let a = 1; a <= 5 && i + a <= n; a++) {
      const syl = phrases.slice(i, i + a).reduce((s, p) => s + p.total, 0);
      for (let b = 1; b <= 3 && j + b <= m; b++) {
        if (a > 1 && b > 1) continue;
        const dur = segments
          .slice(j, j + b)
          .reduce((s, g) => s + (g.end - g.start), 0);
        const c =
          Math.log(dur / (syl * rate)) ** 2 + (a - 1) * 0.12 + (b - 1) * 0.8;
        if (cost[i][j] + c < cost[i + a][j + b]) {
          cost[i + a][j + b] = cost[i][j] + c;
          back[i + a][j + b] = [a, b];
        }
      }
    }
  }
}
if (cost[n][m] >= INF) {
  console.error("Alignement impossible : texte et voix ne correspondent pas.");
  process.exit(1);
}

const groups = [];
for (let i = n, j = m; i > 0 || j > 0; ) {
  const [a, b] = back[i][j];
  groups.unshift({
    phrases: phrases.slice(i - a, i),
    segs: segments.slice(j - b, j),
  });
  i -= a;
  j -= b;
}

/* Horodatage des mots -------------------------------------------------- */

const words = [];
let ratioLog = 0;
for (const g of groups) {
  const items = g.phrases.flatMap((p) =>
    p.words.map((w, k) => ({ w, s: p.sy[k] })),
  );
  const sylSum = items.reduce((a, x) => a + x.s, 0);
  const speechDur = g.segs.reduce((a, s) => a + (s.end - s.start), 0);
  ratioLog += Math.abs(Math.log(speechDur / (sylSum * rate)));
  // Temps de parole « dépliés » sur les plages du groupe.
  const at = (u) => {
    let left = u * speechDur;
    for (const s of g.segs) {
      const d = s.end - s.start;
      if (left <= d) return s.start + left;
      left -= d;
    }
    return g.segs[g.segs.length - 1].end;
  };
  let acc = 0;
  for (const x of items) {
    const start = at(acc / sylSum);
    acc += x.s;
    const end = at(acc / sylSum);
    words.push({
      text: x.w,
      start: Number(start.toFixed(3)),
      end: Number(end.toFixed(3)),
      type: "word",
    });
  }
}

writeFileSync(output, JSON.stringify({ words }, null, 1));
console.log(
  `✓ ${words.length} mots datés · ${phrases.length} phrases sur ${segments.length} plages de parole · ` +
    `écart moyen de débit ${(Math.exp(ratioLog / groups.length) * 100 - 100).toFixed(0)} %`,
);
