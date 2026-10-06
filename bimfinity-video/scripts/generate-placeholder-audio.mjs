/**
 * Génère une bande-son de remplacement dans public/audio.
 *
 * Tous les sons sont synthétisés ici, sans échantillon externe : ils sont
 * donc libres de droits par construction. Ils servent à valider le calage
 * image / son ; remplacez-les par votre sound design définitif (mêmes noms
 * de fichiers, ou modifiez src/audio/soundDesign.ts).
 *
 * Usage : npm run audio:placeholders
 * L'encodage MP3 utilise le ffmpeg fourni par Remotion (npx remotion ffmpeg).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 48000;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "audio");

/* ------------------------------------------------------------------ */
/* Outils de synthèse                                                  */
/* ------------------------------------------------------------------ */

/** PRNG déterministe (mulberry32) : même fichier à chaque génération. */
const prng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buffer = (seconds) => new Float32Array(Math.round(seconds * SAMPLE_RATE));

/** Filtre biquad (formules RBJ), état conservé entre les échantillons. */
const biquad = () => {
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  return (x, type, freq, q) => {
    const w = (2 * Math.PI * Math.min(freq, SAMPLE_RATE * 0.45)) / SAMPLE_RATE;
    const alpha = Math.sin(w) / (2 * q);
    const cos = Math.cos(w);
    let b0, b1, b2;
    if (type === "lowpass") {
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = (1 - cos) / 2;
    } else if (type === "highpass") {
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = (1 + cos) / 2;
    } else {
      b0 = alpha;
      b1 = 0;
      b2 = -alpha; // passe-bande
    }
    const a0 = 1 + alpha,
      a1 = -2 * cos,
      a2 = 1 - alpha;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
};

/** Réverbération de Schroeder (4 peignes + 2 passe-tout). */
const reverb = (input, { mix = 0.3, size = 1, seed = 0 } = {}) => {
  const combs = [1557, 1617, 1491, 1422].map((n) =>
    Math.round((n + seed) * size * (SAMPLE_RATE / 44100)),
  );
  const allpasses = [225, 556].map((n) =>
    Math.round(n * (SAMPLE_RATE / 44100)),
  );
  const out = new Float32Array(input.length);
  const combBuffers = combs.map((n) => ({
    data: new Float32Array(n),
    i: 0,
    store: 0,
  }));
  const apBuffers = allpasses.map((n) => ({ data: new Float32Array(n), i: 0 }));
  for (let s = 0; s < input.length; s++) {
    let wet = 0;
    for (const c of combBuffers) {
      const y = c.data[c.i];
      c.store = y * 0.8 + c.store * 0.2; // amortissement des aigus
      c.data[c.i] = input[s] + c.store * 0.84;
      c.i = (c.i + 1) % c.data.length;
      wet += y;
    }
    wet *= 0.25;
    for (const a of apBuffers) {
      const b = a.data[a.i];
      const y = -wet + b;
      a.data[a.i] = wet + b * 0.5;
      a.i = (a.i + 1) % a.data.length;
      wet = y;
    }
    out[s] = input[s] * (1 - mix) + wet * mix;
  }
  return out;
};

const normalize = (channels, peak) => {
  let max = 0;
  for (const ch of channels)
    for (const v of ch) max = Math.max(max, Math.abs(v));
  const gain = max > 0 ? peak / max : 1;
  for (const ch of channels) for (let i = 0; i < ch.length; i++) ch[i] *= gain;
  return channels;
};

const fade = (data, inSeconds, outSeconds) => {
  const fi = Math.round(inSeconds * SAMPLE_RATE);
  const fo = Math.round(outSeconds * SAMPLE_RATE);
  for (let i = 0; i < fi && i < data.length; i++)
    data[i] *= Math.sin((i / fi) * (Math.PI / 2)) ** 2;
  for (let i = 0; i < fo && i < data.length; i++)
    data[data.length - 1 - i] *= Math.sin((i / fo) * (Math.PI / 2)) ** 2;
  return data;
};

const writeWav = (file, channels) => {
  const length = channels[0].length;
  const bytes = 44 + length * channels.length * 2;
  const view = new DataView(new ArrayBuffer(bytes));
  const text = (offset, value) =>
    [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels.length, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * channels.length * 2, true);
  view.setUint16(32, channels.length * 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, length * channels.length * 2, true);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (const ch of channels) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      offset += 2;
    }
  }
  writeFileSync(file, Buffer.from(view.buffer));
};

const toMp3 = (wav, mp3) => {
  try {
    // Chemins relatifs au projet : pas d'espaces à échapper sous Windows (shell).
    const result = spawnSync(
      "npx",
      [
        "remotion",
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-i",
        relative(ROOT, wav),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "192k",
        relative(ROOT, mp3),
      ],
      { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" },
    );
    if (result.status !== 0) {
      throw new Error(`Encodage MP3 impossible pour ${mp3}`);
    }
  } finally {
    rmSync(wav, { force: true });
  }
};

const midi = (note) => 440 * 2 ** ((note - 69) / 12);

/* ------------------------------------------------------------------ */
/* Sons                                                                */
/* ------------------------------------------------------------------ */

/** Nappe ambiante : accord suspendu, scies désaccordées filtrées, souffle. */
const ambient = () => {
  const seconds = 32.5;
  const left = buffer(seconds);
  const right = buffer(seconds);
  const notes = [38, 45, 52, 57, 61, 64].map(midi); // Ré, La, Mi, La, Do#, Mi
  const random = prng(7);
  const filterL = biquad();
  const filterR = biquad();
  const air = biquad();
  const phases = notes.map(() => [random(), random(), random()]);
  for (let i = 0; i < left.length; i++) {
    const t = i / SAMPLE_RATE;
    let l = 0;
    let r = 0;
    notes.forEach((f, n) => {
      const detunes = [-0.006, 0, 0.007];
      detunes.forEach((d, k) => {
        phases[n][k] = (phases[n][k] + (f * (1 + d)) / SAMPLE_RATE) % 1;
        const saw = 2 * phases[n][k] - 1;
        const level =
          (n < 2 ? 0.5 : 0.28) * (0.75 + 0.25 * Math.sin(t * 0.21 + n * 1.7));
        l += saw * level * (k === 0 ? 1 : 0.6);
        r += saw * level * (k === 2 ? 1 : 0.6);
      });
    });
    const cutoff =
      520 + 380 * Math.sin(t * 0.17) + 200 * Math.sin(t * 0.07 + 1);
    const breath = air(
      (random() * 2 - 1) * 0.05,
      "bandpass",
      2400 + 600 * Math.sin(t * 0.11),
      0.8,
    );
    left[i] = filterL(l, "lowpass", cutoff, 0.7) * 0.12 + breath;
    right[i] = filterR(r, "lowpass", cutoff * 1.04, 0.7) * 0.12 + breath * 0.9;
  }
  const channels = [
    reverb(left, { mix: 0.45, size: 1.2 }),
    reverb(right, { mix: 0.45, size: 1.2, seed: 23 }),
  ];
  channels.forEach((ch) => fade(ch, 2.5, 3));
  return normalize(channels, 0.5);
};

/** Tick de frappe : bruit très court + clic aigu. */
const typeTick = () => {
  const data = buffer(0.05);
  const random = prng(11);
  const hp = biquad();
  for (let i = 0; i < data.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.0008) * Math.exp(-t / 0.006);
    const noise = hp(random() * 2 - 1, "highpass", 2500, 0.7);
    data[i] = (noise * 0.7 + Math.sin(2 * Math.PI * 4200 * t) * 0.3) * env;
  }
  return normalize([data], 0.7);
};

/** Riser : bruit filtré dont la fréquence monte + nappe tonale ascendante. */
const riser = () => {
  const seconds = 4.4;
  const left = buffer(seconds);
  const right = buffer(seconds);
  const random = prng(19);
  const bpL = biquad();
  const bpR = biquad();
  let phase = 0;
  let phase2 = 0;
  for (let i = 0; i < left.length; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / seconds;
    const env = p ** 2.2;
    const center = 280 * (6500 / 280) ** p;
    const freq = 110 * 4 ** p;
    phase = (phase + freq / SAMPLE_RATE) % 1;
    phase2 = (phase2 + (freq * 1.5) / SAMPLE_RATE) % 1;
    const tone =
      Math.sin(2 * Math.PI * phase) * 0.35 +
      Math.sin(2 * Math.PI * phase2) * 0.18;
    const nl = bpL(random() * 2 - 1, "bandpass", center, 3.5);
    const nr = bpR(random() * 2 - 1, "bandpass", center * 1.03, 3.5);
    left[i] = (nl * 1.6 + tone) * env;
    right[i] = (nr * 1.6 + tone) * env;
  }
  const channels = [
    reverb(left, { mix: 0.25 }),
    reverb(right, { mix: 0.25, seed: 31 }),
  ];
  channels.forEach((ch) => fade(ch, 0.05, 0.06));
  return normalize(channels, 0.8);
};

/** Whoosh : souffle filtré qui balaie de gauche à droite et culmine à 0,3 s. */
const whoosh = () => {
  const seconds = 0.9;
  const left = buffer(seconds);
  const right = buffer(seconds);
  const random = prng(23);
  const bp = biquad();
  const peak = 0.3;
  for (let i = 0; i < left.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < peak ? (t / peak) ** 2.5 : Math.exp(-(t - peak) / 0.14);
    const center =
      t < peak
        ? 400 + 2600 * (t / peak)
        : 3000 * Math.exp(-(t - peak) / 0.25) + 500;
    const n = bp(random() * 2 - 1, "bandpass", center, 1.2) * env;
    const pan = Math.min(1, t / (peak * 1.6));
    left[i] = n * Math.cos(pan * Math.PI * 0.5);
    right[i] = n * Math.sin(pan * Math.PI * 0.5 + 0.3);
  }
  return normalize([left, right], 0.8);
};

/**
 * Boom : sinus grave à glissando descendant, transitoire et saturation douce.
 * Le corps démarre plus haut et porte une harmonique : l'impact reste audible
 * sur les haut-parleurs de téléphone et d'ordinateur portable.
 */
const boom = () => {
  const seconds = 3;
  const data = buffer(seconds);
  const random = prng(29);
  const lp = biquad();
  let phase = 0;
  for (let i = 0; i < data.length; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 52 + 120 * Math.exp(-t / 0.09);
    phase = (phase + freq / SAMPLE_RATE) % 1;
    const body =
      (Math.sin(2 * Math.PI * phase) +
        0.35 * Math.sin(4 * Math.PI * phase) * Math.exp(-t / 0.35)) *
      Math.exp(-t / 0.85) *
      Math.min(1, t / 0.003);
    const click =
      lp(random() * 2 - 1, "lowpass", 1800, 0.7) * Math.exp(-t / 0.012) * 0.6;
    data[i] = Math.tanh((body + click) * 1.8) * 0.8;
  }
  fade(data, 0, 0.4);
  return normalize([data], 0.95);
};

/** Tick d'interface : « verre » cristallin, deux partiels. */
const uiTick = () => {
  const data = buffer(0.3);
  for (let i = 0; i < data.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.0015) * Math.exp(-t / 0.035);
    const drop = 1 - 0.04 * Math.min(1, t / 0.05);
    data[i] =
      (Math.sin(2 * Math.PI * 1900 * drop * t) * 0.6 +
        Math.sin(2 * Math.PI * 2850 * drop * t) * 0.3) *
      env;
  }
  const out = reverb(data, { mix: 0.2, size: 0.5 });
  fade(out, 0, 0.04); // queue de réverbération refermée en douceur
  return normalize([out], 0.6);
};

/** Résolution : accord majeur arpégé, attaques douces, longue queue. */
const resolve = () => {
  const seconds = 5.2;
  const left = buffer(seconds);
  const right = buffer(seconds);
  const notes = [62, 69, 73, 76, 78].map(midi); // Ré, La, Do#, Mi, Fa#
  notes.forEach((f, n) => {
    const start = n * 0.07;
    for (let i = Math.round(start * SAMPLE_RATE); i < left.length; i++) {
      const t = i / SAMPLE_RATE - start;
      const env = Math.min(1, t / 0.25) * Math.exp(-t / 1.6);
      const v =
        (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(4 * Math.PI * f * t)) *
        env *
        0.2;
      const pan = n / (notes.length - 1);
      left[i] += v * (1 - pan * 0.6);
      right[i] += v * (0.4 + pan * 0.6);
    }
  });
  const channels = [
    reverb(left, { mix: 0.5, size: 1.3 }),
    reverb(right, { mix: 0.5, size: 1.3, seed: 17 }),
  ];
  channels.forEach((ch) => fade(ch, 0.01, 1.2));
  return normalize(channels, 0.7);
};

/* ------------------------------------------------------------------ */

mkdirSync(OUT, { recursive: true });

const sounds = [
  ["ambient", ambient, "mp3"],
  ["type-tick", typeTick, "wav"],
  ["riser", riser, "mp3"],
  ["whoosh", whoosh, "wav"],
  ["boom", boom, "wav"],
  ["ui-tick", uiTick, "wav"],
  ["resolve", resolve, "mp3"],
];

for (const [name, synth, format] of sounds) {
  const wav = join(OUT, `${name}.wav`);
  writeWav(wav, synth());
  if (format === "mp3") {
    toMp3(wav, join(OUT, `${name}.mp3`));
  }
  console.log(`✓ public/audio/${name}.${format}`);
}
