/**
 * Recale le conducteur (src/timeline.ts) sur une voix off, à partir d'une
 * transcription horodatée mot à mot.
 *
 * Formats acceptés :
 * - sortie ElevenLabs Scribe : { "words": [{ "text", "start", "end", "type" }] }
 * - tableau simple : [{ "text", "start", "end" }]
 *
 * Usage : node scripts/retime-from-transcript.mjs transcription.json
 *         puis : npm run audio   (la nappe musicale suit le nouveau conducteur)
 *
 * Principe : on parcourt les répliques dans l'ordre et on cherche, dans la
 * transcription, la suite de mots de chacune. Les chiffres (« 137 500 »)
 * sont ignorés pour l'alignement, car la voix les prononce en toutes lettres.
 * Une réplique introuvable est placée par interpolation entre ses voisines.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIMELINE = join(ROOT, "src", "timeline.ts");

/** Avance des sous-titres sur la voix (s) : le mot apparaît juste avant d'être dit. */
const LEAD = 0.08;
/** Durée estimée d'un nombre prononcé, par groupe de chiffres (s). */
const NUMBER_GROUP = 0.55;

const file = process.argv[2];
if (!file) {
  console.error(
    "Usage : node scripts/retime-from-transcript.mjs transcription.json",
  );
  process.exit(1);
}

const normalize = (w) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9 -]/g, "")
    .trim();

/** Découpe un texte en jetons comparables (« c'est » → « c », « est »). */
const tokens = (text) =>
  normalize(text.replace(/\*/g, ""))
    .split(/[\s-]+/)
    .filter(Boolean);

const isNumber = (tok) => /^\d+$/.test(tok);

/** Mots d'un nombre prononcé en toutes lettres (« cent trente-sept mille »). */
const NUMBER_WORDS = new Set(
  "zero deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente quarante cinquante soixante cent cents mille".split(
    " ",
  ),
);

/**
 * Début réel d'un nombre qui précède le mot `index` : on remonte tant que
 * la transcription contient des chiffres ou des mots de nombre.
 */
const numberStart = (index) => {
  let k = index;
  while (
    k > 0 &&
    index - k < 8 &&
    (isNumber(spoken[k - 1].tok) || NUMBER_WORDS.has(spoken[k - 1].tok))
  ) {
    k -= 1;
  }
  return k < index ? spoken[k].start : null;
};

/* Transcription ------------------------------------------------------ */

const raw = JSON.parse(readFileSync(file, "utf8"));
const list = Array.isArray(raw)
  ? raw
  : (raw.words ?? raw.transcripts?.[0]?.words ?? []);
const spoken = list
  .filter((w) => (w.type ?? "word") === "word")
  .flatMap((w) =>
    tokens(w.text).map((tok) => ({ tok, start: w.start, end: w.end })),
  );
if (spoken.length === 0) {
  console.error("Aucun mot horodaté trouvé dans la transcription.");
  process.exit(1);
}

/* Conducteur --------------------------------------------------------- */

let source = readFileSync(TIMELINE, "utf8");
const listStart = source.indexOf("export const cues");
const listEnd = source.indexOf("];", listStart);
const cueRe =
  /\{\s*id: "(\w+)",\s*at: ([\d.]+),(?:\s*end: ([\d.]+),)?\s*parts: \[([\s\S]*?)\],?\s*\}/g;
const partRe = /(body|impact|serif)\("([^"]*)"(?:, ([\d.]+))?\)/g;

const cues = [...source.slice(listStart, listEnd).matchAll(cueRe)].map((m) => ({
  raw: m[0],
  id: m[1],
  at: Number(m[2]),
  end: m[3] === undefined ? null : Number(m[3]),
  parts: [...m[4].matchAll(partRe)].map((p) => ({
    kind: p[1],
    text: p[2],
    delay: p[3] === undefined ? 0 : Number(p[3]),
    toks: tokens(p[2]),
  })),
}));

/* Alignement --------------------------------------------------------- */

let cursor = 0;
for (const cue of cues) {
  const all = cue.parts.flatMap((p, pi) => p.toks.map((tok) => ({ tok, pi })));
  const firstWord = all.findIndex((x) => !isNumber(x.tok));
  if (firstWord < 0) {
    continue;
  }
  const words = all.filter((x) => !isNumber(x.tok));
  let found = -1;
  for (let i = cursor; i < Math.min(spoken.length, cursor + 60); i++) {
    if (spoken[i].tok !== words[0].tok) continue;
    const next = words[1];
    if (!next || spoken.slice(i + 1, i + 5).some((s) => s.tok === next.tok)) {
      found = i;
      break;
    }
  }
  if (found < 0) {
    console.warn(`⚠ « ${cue.id} » introuvable : placé par interpolation.`);
    continue;
  }
  // Les nombres qui précèdent le premier mot sont prononcés avant lui.
  const skippedNumbers = all.slice(0, firstWord).length;
  const start =
    skippedNumbers > 0
      ? (numberStart(found) ??
        spoken[found].start - skippedNumbers * NUMBER_GROUP)
      : spoken[found].start;
  cue.newAt = Math.max(0, start - LEAD);
  // Délai de chaque ligne : instant de son premier mot reconnu.
  let j = found;
  cue.parts.forEach((part, pi) => {
    const first = part.toks.find((tok) => !isNumber(tok));
    if (pi === 0 || !first) return;
    const leadingNumbers = isNumber(part.toks[0]);
    for (let k = j; k < Math.min(spoken.length, j + 25); k++) {
      if (spoken[k].tok === first) {
        const begin = (leadingNumbers && numberStart(k)) || spoken[k].start;
        part.newDelay = Math.max(0, begin - LEAD - cue.newAt);
        j = k;
        break;
      }
    }
  });
  // Fin de la réplique : on suit ses mots un à un (petite tolérance pour un
  // mot mal transcrit), sans jamais déborder sur la réplique suivante.
  let last = found;
  for (const w of words.slice(1)) {
    for (let k = last + 1; k < Math.min(spoken.length, last + 4); k++) {
      if (spoken[k].tok === w.tok) {
        last = k;
        break;
      }
    }
  }
  cue.lastWordEnd = spoken[last].end;
  cursor = last + 1;
}

// Interpolation des répliques non trouvées.
cues.forEach((cue, i) => {
  if (cue.newAt !== undefined) return;
  const prev = [...cues.slice(0, i)]
    .reverse()
    .find((c) => c.newAt !== undefined);
  const next = cues.slice(i + 1).find((c) => c.newAt !== undefined);
  if (prev && next) {
    const ratio = (cue.at - prev.at) / (next.at - prev.at || 1);
    cue.newAt = prev.newAt + ratio * (next.newAt - prev.newAt);
  } else if (prev) {
    cue.newAt = prev.newAt + (cue.at - prev.at);
  } else {
    cue.newAt = cue.at;
  }
});

/* Écriture ----------------------------------------------------------- */

const round = (v) => Math.round(v * 100) / 100;
const lastSpoken = spoken[spoken.length - 1].end;
const total = Math.ceil((lastSpoken + 3) * 2) / 2;
let body = source.slice(listStart, listEnd);
cues.forEach((cue, i) => {
  const nextAt = cues[i + 1]?.newAt ?? Infinity;
  let block = cue.raw.replace(/at: [\d.]+/, `at: ${round(cue.newAt)}`);
  if (cue.end !== null) {
    // La dernière réplique reste à l'écran jusqu'au fondu final.
    const end =
      i === cues.length - 1
        ? total - 1
        : Math.min(
            nextAt - 0.05,
            (cue.lastWordEnd ?? cue.newAt + (cue.end - cue.at)) + 0.45,
          );
    block = block.replace(/end: [\d.]+/, `end: ${round(end)}`);
  }
  cue.parts.forEach((part) => {
    if (part.newDelay === undefined) return;
    const from = new RegExp(
      `${part.kind}\\("${part.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"(?:, [\\d.]+)?\\)`,
    );
    block = block.replace(
      from,
      `${part.kind}("${part.text}", ${round(part.newDelay)})`,
    );
  });
  body = body.replace(cue.raw, block);
});

source = source.slice(0, listStart) + body + source.slice(listEnd);
source = source.replace(/TOTAL_SECONDS = [\d.]+/, `TOTAL_SECONDS = ${total}`);
writeFileSync(TIMELINE, source);

const moved = cues.filter((c) => Math.abs(c.newAt - c.at) > 0.01).length;
console.log(
  `✓ ${moved} répliques recalées sur ${cues.length}. Durée totale : ${total} s.`,
);
console.log(
  "  Étape suivante : npm run audio (régénère la nappe sur le nouveau conducteur).",
);
