/**
 * Génère la bande-son dans public/audio : une nappe musicale arrangée sur
 * le conducteur (bed.mp3) et des bruitages ponctuels.
 *
 * Tout est synthétisé ici, sans échantillon externe : libre de droits par
 * construction. Les instants sont lus dans src/timeline.ts ; après un
 * recalage du conducteur (voix off), relancez simplement : npm run audio
 *
 * L'encodage MP3 utilise ffmpeg (celui du système, sinon celui de Remotion).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "audio");

/* ------------------------------------------------------------------ */
/* Conducteur                                                          */
/* ------------------------------------------------------------------ */

const timeline = readFileSync(join(ROOT, "src", "timeline.ts"), "utf8");
const T = Object.fromEntries(
  [...timeline.matchAll(/id: "(\w+)",\s*at: ([\d.]+)/g)].map((m) => [
    m[1],
    Number(m[2]),
  ]),
);
const TOTAL = Number(timeline.match(/TOTAL_SECONDS = ([\d.]+)/)[1]);
const need = (id) => {
  if (!(id in T)) throw new Error(`Réplique absente du conducteur : ${id}`);
  return T[id];
};

/* ------------------------------------------------------------------ */
/* Outils de synthèse                                                  */
/* ------------------------------------------------------------------ */

const prng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buffer = (seconds) => new Float32Array(Math.round(seconds * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

/** Filtre biquad (formules RBJ). */
const biquad = () => {
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  return (x, type, freq, q) => {
    const w = (2 * Math.PI * Math.min(freq, SR * 0.45)) / SR;
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
      b2 = -alpha;
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
const reverb = (
  input,
  { mix = 0.3, size = 1, seed = 0, feedback = 0.84 } = {},
) => {
  const combs = [1557, 1617, 1491, 1422].map((n) => ({
    data: new Float32Array(Math.round((n + seed) * size)),
    i: 0,
    store: 0,
  }));
  const aps = [225, 556].map((n) => ({ data: new Float32Array(n), i: 0 }));
  const out = new Float32Array(input.length);
  for (let s = 0; s < input.length; s++) {
    let wet = 0;
    for (const c of combs) {
      const y = c.data[c.i];
      c.store = y * 0.8 + c.store * 0.2;
      c.data[c.i] = input[s] + c.store * feedback;
      c.i = (c.i + 1) % c.data.length;
      wet += y;
    }
    wet *= 0.25;
    for (const a of aps) {
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

const fade = (data, inS, outS) => {
  const fi = Math.round(inS * SR),
    fo = Math.round(outS * SR);
  for (let i = 0; i < fi && i < data.length; i++)
    data[i] *= Math.sin(((i / fi) * Math.PI) / 2) ** 2;
  for (let i = 0; i < fo && i < data.length; i++)
    data[data.length - 1 - i] *= Math.sin(((i / fo) * Math.PI) / 2) ** 2;
  return data;
};

/** Ajoute `src` dans `dst` à partir de `at` secondes. */
const place = (dst, src, at, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++)
    if (o + i >= 0) dst[o + i] += src[i] * gain;
};

/** Enveloppe linéaire par points [[t, v], …]. */
const envelope = (points) => (t) => {
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [t1, v1] = points[i];
    const [t0, v0] = points[i - 1];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  }
  return points[points.length - 1][1];
};

const writeWav = (file, channels) => {
  const length = channels[0].length;
  const bytes = 44 + length * channels.length * 2;
  const view = new DataView(new ArrayBuffer(bytes));
  const text = (o, v) =>
    [...v].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels.length, true);
  view.setUint32(24, SR, true);
  view.setUint32(28, SR * channels.length * 2, true);
  view.setUint16(32, channels.length * 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, length * channels.length * 2, true);
  let o = 44;
  for (let i = 0; i < length; i++) {
    for (const ch of channels) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      view.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      o += 2;
    }
  }
  writeFileSync(file, Buffer.from(view.buffer));
};

const ffmpeg = () => {
  const system = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return system.status === 0 ? ["ffmpeg"] : ["npx", "remotion", "ffmpeg"];
};

const toMp3 = (wav, mp3) => {
  const [cmd, ...pre] = ffmpeg();
  const r = spawnSync(
    cmd,
    [
      ...pre,
      "-y",
      "-loglevel",
      "error",
      "-i",
      wav,
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "192k",
      mp3,
    ],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );
  rmSync(wav, { force: true });
  if (r.status !== 0) throw new Error(`Encodage MP3 impossible : ${mp3}`);
};

/* ------------------------------------------------------------------ */
/* Bruitages                                                           */
/* ------------------------------------------------------------------ */

/** Impact grave : sinus à glissando descendant + transitoire. */
const boom = (seconds = 2.2, seed = 29) => {
  const d = buffer(seconds);
  const rnd = prng(seed);
  const lp = biquad();
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const f = 48 + 130 * Math.exp(-t / 0.08);
    ph = (ph + f / SR) % 1;
    const body =
      (Math.sin(2 * Math.PI * ph) +
        0.3 * Math.sin(4 * Math.PI * ph) * Math.exp(-t / 0.3)) *
      Math.exp(-t / 0.7) *
      Math.min(1, t / 0.003);
    const click =
      lp(rnd() * 2 - 1, "lowpass", 2200, 0.7) * Math.exp(-t / 0.015) * 0.7;
    d[i] = Math.tanh((body + click) * 1.8) * 0.8;
  }
  return normalize([fade(d, 0, 0.3)], 0.95);
};

/** Souffle de transition, balayé de gauche à droite. */
const whoosh = () => {
  const s = 0.7,
    L = buffer(s),
    R = buffer(s);
  const rnd = prng(23),
    bp = biquad(),
    peak = 0.22;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const env = t < peak ? (t / peak) ** 2.5 : Math.exp(-(t - peak) / 0.12);
    const c =
      t < peak
        ? 500 + 2800 * (t / peak)
        : 3300 * Math.exp(-(t - peak) / 0.2) + 500;
    const n = bp(rnd() * 2 - 1, "bandpass", c, 1.1) * env;
    const pan = Math.min(1, t / (peak * 1.6));
    L[i] = n * Math.cos((pan * Math.PI) / 2);
    R[i] = n * Math.sin((pan * Math.PI) / 2 + 0.3);
  }
  return normalize([L, R], 0.8);
};

/** Scintillement : arpège de cloches aiguës + réverbération. */
const sparkle = () => {
  const s = 2.4,
    L = buffer(s),
    R = buffer(s);
  const notes = [86, 90, 93, 98, 102].map(midi);
  notes.forEach((f, n) => {
    const st = n * 0.055;
    for (let i = Math.round(st * SR); i < L.length; i++) {
      const t = i / SR - st;
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.45);
      const v =
        (Math.sin(2 * Math.PI * f * t) +
          0.3 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t / 0.1)) *
        env *
        0.25;
      const pan = n / (notes.length - 1);
      L[i] += v * (1 - pan * 0.7);
      R[i] += v * (0.3 + pan * 0.7);
    }
  });
  const ch = [
    reverb(L, { mix: 0.45, size: 0.8 }),
    reverb(R, { mix: 0.45, size: 0.8, seed: 11 }),
  ];
  ch.forEach((c) => fade(c, 0, 0.6));
  return normalize(ch, 0.7);
};

/** Désintégration : poussière de verre qui retombe. */
const shatter = () => {
  const s = 1.8,
    L = buffer(s),
    R = buffer(s);
  const rnd = prng(41);
  for (let g = 0; g < 70; g++) {
    const st = Math.pow(rnd(), 1.7) * 1.1;
    const f = 2200 + rnd() * 5200;
    const dec = 0.03 + rnd() * 0.08;
    const amp = 0.25 * (1 - st / 1.3);
    const pan = rnd();
    for (
      let i = Math.round(st * SR);
      i < L.length && i < Math.round((st + dec * 6) * SR);
      i++
    ) {
      const t = i / SR - st;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / dec) * amp;
      L[i] += v * (1 - pan);
      R[i] += v * pan;
    }
  }
  const hp = biquad(),
    hp2 = biquad();
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const n = (rnd() * 2 - 1) * Math.exp(-t / 0.35) * 0.25;
    L[i] += hp(n, "highpass", 3000, 0.7);
    R[i] += hp2(n, "highpass", 3200, 0.7);
  }
  const ch = [
    reverb(L, { mix: 0.4, size: 0.9 }),
    reverb(R, { mix: 0.4, size: 0.9, seed: 7 }),
  ];
  ch.forEach((c) => fade(c, 0, 0.5));
  return normalize(ch, 0.7);
};

/** Vibreur de téléphone : deux salves. */
const buzz = () => {
  const d = buffer(0.95);
  const lp = biquad();
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const on = t < 0.35 || (t > 0.5 && t < 0.85) ? 1 : 0;
    ph = (ph + 160 / SR) % 1;
    const sq = ph < 0.5 ? 1 : -1;
    const am = 0.6 + 0.4 * Math.sin(2 * Math.PI * 28 * t);
    d[i] = lp(sq * am * on, "lowpass", 900, 0.9) * 0.8;
  }
  return normalize([fade(d, 0.005, 0.02)], 0.6);
};

/** Coffre : grincement de bois puis choc sourd. */
const chest = () => {
  const s = 1.3,
    d = buffer(s);
  const rnd = prng(53);
  const bp = biquad(),
    lp = biquad();
  let ph = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    // Grincement : impulsions périodiques filtrées, hauteur qui glisse.
    const f = 90 + 70 * Math.sin(Math.min(1, t / 0.45) * Math.PI);
    ph = (ph + f / SR) % 1;
    const creakEnv = t < 0.5 ? Math.sin((t / 0.5) * Math.PI) : 0;
    const creak =
      bp((ph < 0.08 ? 1 : 0) + (rnd() * 2 - 1) * 0.15, "bandpass", 1200, 4) *
      creakEnv *
      1.6;
    // Choc d'ouverture.
    const t2 = t - 0.48;
    const thud =
      t2 > 0
        ? Math.sin(2 * Math.PI * (70 + 60 * Math.exp(-t2 / 0.04)) * t2) *
            Math.exp(-t2 / 0.18) +
          lp(rnd() * 2 - 1, "lowpass", 900, 0.7) * Math.exp(-t2 / 0.03) * 0.6
        : 0;
    d[i] = creak + thud * 0.9;
  }
  return normalize([fade(reverb(d, { mix: 0.18, size: 0.6 }), 0, 0.3)], 0.8);
};

/** Tic d'horloge. */
const tick = () => {
  const d = buffer(0.12);
  const rnd = prng(61),
    hp = biquad();
  for (let i = 0; i < d.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.0005) * Math.exp(-t / 0.012);
    d[i] =
      (hp(rnd() * 2 - 1, "highpass", 2000, 0.8) * 0.6 +
        Math.sin(2 * Math.PI * 3100 * t) * 0.4) *
      env;
  }
  return normalize([d], 0.7);
};

/* ------------------------------------------------------------------ */
/* Nappe musicale arrangée sur le conducteur                           */
/* ------------------------------------------------------------------ */

const bed = () => {
  const L = buffer(TOTAL),
    R = buffer(TOTAL);
  const rnd = prng(7);
  const reveal = need("estLa");
  const lastNight = need("dec4");

  // 1. Drone grave (Ré) et nappe mineure, puis majeure à la révélation.
  const minor = [50, 53, 57, 60, 64].map(midi); // Ré, Fa, La, Do, Mi
  const major = [50, 54, 57, 62, 66, 69].map(midi); // Ré, Fa#, La, Ré, Fa#, La
  const padLevel = envelope([
    [0, 0.0],
    [0.6, 0.55],
    [need("etToi"), 0.4],
    [need("potes"), 0.5],
    [need("probleme1"), 0.6],
    [need("deuxSemaines"), 0.7],
    [lastNight, 0.45],
    [need("coffreBrille"), 0.6],
    [reveal - 0.05, 0.75],
    [reveal, 0],
    [TOTAL, 0],
  ]);
  const majorLevel = envelope([
    [0, 0],
    [reveal, 0],
    [reveal + 0.6, 1],
    [TOTAL - 2.5, 0.9],
    [TOTAL, 0],
  ]);
  const droneLevel = envelope([
    [0, 0],
    [1, 0.9],
    [reveal - 0.1, 1],
    [reveal + 0.3, 0.7],
    [TOTAL - 1.5, 0.5],
    [TOTAL, 0],
  ]);
  const fL = biquad(),
    fR = biquad(),
    fD = biquad();
  const phases = [...minor, ...major].map(() => [rnd(), rnd(), rnd()]);
  let dph = 0,
    dph2 = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    let l = 0,
      r = 0;
    const pm = padLevel(t),
      pM = majorLevel(t);
    [...minor, ...major].forEach((f, n) => {
      const isMajor = n >= minor.length;
      const lvl = isMajor ? pM : pm;
      if (lvl <= 0.001) return;
      [-0.005, 0, 0.006].forEach((d, k) => {
        phases[n][k] = (phases[n][k] + (f * (1 + d)) / SR) % 1;
        const saw = 2 * phases[n][k] - 1;
        const v = saw * lvl * 0.16 * (0.8 + 0.2 * Math.sin(t * 0.3 + n));
        l += v * (k === 0 ? 1 : 0.55);
        r += v * (k === 2 ? 1 : 0.55);
      });
    });
    const cutoff = 650 + 450 * Math.sin(t * 0.13) + (t > reveal ? 900 : 0);
    dph = (dph + midi(26) / SR) % 1;
    dph2 = (dph2 + midi(33) / SR) % 1;
    const drone =
      fD(
        Math.sin(2 * Math.PI * dph) * 0.8 + (2 * dph2 - 1) * 0.25,
        "lowpass",
        220,
        0.7,
      ) * droneLevel(t);
    L[i] = fL(l, "lowpass", cutoff, 0.7) + drone * 0.55;
    R[i] = fR(r, "lowpass", cutoff * 1.05, 0.7) + drone * 0.55;
  }

  // 2. Pulsation (battement grave) de « Et toi » à « Personne ne quitte ».
  const kick = (() => {
    const d = buffer(0.5);
    let ph = 0;
    for (let i = 0; i < d.length; i++) {
      const t = i / SR;
      ph = (ph + (45 + 90 * Math.exp(-t / 0.05)) / SR) % 1;
      d[i] =
        Math.sin(2 * Math.PI * ph) *
        Math.exp(-t / 0.16) *
        Math.min(1, t / 0.002);
    }
    return d;
  })();
  const beat = 0.6; // 100 BPM
  const pulseLevel = envelope([
    [need("etToi"), 0.35],
    [need("potes"), 0.5],
    [need("probleme1"), 0.65],
    [need("deuxSemaines"), 0.75],
    [need("personne"), 0.8],
  ]);
  for (let t = need("etToi"); t < need("dec4"); t += beat) {
    place(L, kick, t, pulseLevel(t) * 0.9);
    place(R, kick, t, pulseLevel(t) * 0.9);
    place(L, kick, t + 0.2, pulseLevel(t) * 0.45);
    place(R, kick, t + 0.2, pulseLevel(t) * 0.45);
  }

  // 3. Charleston étouffé sur les contretemps (de « Tes potes » au 2e « Le problème »).
  const hat = (() => {
    const d = buffer(0.06);
    const hp = biquad();
    for (let i = 0; i < d.length; i++) {
      const t = i / SR;
      d[i] = hp(rnd() * 2 - 1, "highpass", 7000, 0.7) * Math.exp(-t / 0.012);
    }
    return d;
  })();
  for (let t = need("potes") + beat / 2; t < need("probleme2"); t += beat / 2) {
    const accent =
      Math.round((t - need("potes")) / (beat / 2)) % 2 === 1 ? 0.22 : 0.12;
    place(L, hat, t, accent * 0.8);
    place(R, hat, t + 0.004, accent);
  }

  // 4. Basse en croches (de « Trois semaines » à « Deux semaines »).
  const pattern = [38, 38, 41, 38, 38, 38, 36, 33].map(midi);
  const note = (f, len) => {
    const d = buffer(len + 0.05);
    const lp = biquad();
    let ph = 0;
    for (let i = 0; i < d.length; i++) {
      const t = i / SR;
      ph = (ph + f / SR) % 1;
      const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.18);
      d[i] =
        lp(2 * ph - 1, "lowpass", 300 + 1200 * Math.exp(-t / 0.05), 1.2) * env;
    }
    return d;
  };
  let k = 0;
  for (
    let t = need("probleme1");
    t < need("deuxSemaines");
    t += beat / 2, k++
  ) {
    const n = note(pattern[k % pattern.length], beat / 2);
    place(L, n, t, 0.32);
    place(R, n, t, 0.32);
  }

  // 5. Tic-tac (les jours filent, le dernier soir).
  const tk = tick()[0];
  for (let t = need("probleme2"); t < need("coffreBrille"); t += 0.5) {
    const g = Math.round((t - need("probleme2")) / 0.5) % 2 ? 0.12 : 0.18;
    place(L, tk, t, g);
    place(R, tk, t, g * 0.8);
  }

  // 6. Montée (« Un coffre brille » → « Le jeton est là »).
  const riseStart = need("coffreBrille");
  const riseLen = reveal - riseStart;
  const bpL = biquad(),
    bpR = biquad();
  let rp = 0;
  for (let i = Math.round(riseStart * SR); i < Math.round(reveal * SR); i++) {
    const t = i / SR - riseStart;
    const p = t / riseLen;
    const env = p ** 2;
    const c = 300 * (7000 / 300) ** p;
    rp = (rp + (110 * 4 ** p) / SR) % 1;
    const tone = Math.sin(2 * Math.PI * rp) * 0.25;
    L[i] += (bpL(rnd() * 2 - 1, "bandpass", c, 3) * 1.4 + tone) * env * 0.6;
    R[i] +=
      (bpR(rnd() * 2 - 1, "bandpass", c * 1.03, 3) * 1.4 + tone) * env * 0.6;
  }

  // 7. Révélation : grand impact + scintillements.
  const hit = boom(3, 99)[0];
  place(L, hit, reveal, 0.9);
  place(R, hit, reveal, 0.9);
  const sp = sparkle();
  place(L, sp[0], reveal + 0.05, 0.5);
  place(R, sp[1], reveal + 0.05, 0.5);
  place(L, sp[0], need("pasAbandonne") + 0.35, 0.45);
  place(R, sp[1], need("pasAbandonne") + 0.35, 0.45);

  const ch = [
    reverb(L, { mix: 0.3, size: 1.25 }),
    reverb(R, { mix: 0.3, size: 1.25, seed: 23 }),
  ];
  ch.forEach((c) => fade(c, 0.4, 1.2));
  return normalize(ch, 0.85);
};

/* ------------------------------------------------------------------ */

mkdirSync(OUT, { recursive: true });

const sounds = [
  ["bed", bed, "mp3"],
  ["boom", () => boom(), "wav"],
  ["whoosh", whoosh, "wav"],
  ["sparkle", sparkle, "wav"],
  ["shatter", shatter, "wav"],
  ["buzz", buzz, "wav"],
  ["chest", chest, "wav"],
  ["tick", tick, "wav"],
];

for (const [name, synth, format] of sounds) {
  const wav = join(OUT, `${name}.wav`);
  writeWav(wav, synth());
  if (format === "mp3") toMp3(wav, join(OUT, `${name}.mp3`));
  console.log(`✓ public/audio/${name}.${format}`);
}
