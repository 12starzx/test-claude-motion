// Convertit « BOON BUY » (Nunito Black) en tracés SVG pour l'extrusion 3D.
// Sortie : public/data/wordmark.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontFile = path.join(root, "node_modules/@fontsource/nunito/files/nunito-latin-900-normal.woff");
const buf = fs.readFileSync(fontFile);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const SIZE = 100; // unités arbitraires, remises à l'échelle dans la scène
const lines = (process.argv[2] ?? "BOON BUY").split("|");
const out = { size: SIZE, capHeight: (font.tables.os2.sCapHeight / font.unitsPerEm) * SIZE, lines: [] };
for (const text of lines) {
  const p = font.getPath(text, 0, 0, SIZE, { kerning: true, letterSpacing: 0.01 });
  // Repère Y vers le haut (Three.js) : on inverse les ordonnées des commandes.
  for (const c of p.commands) for (const k of ["y", "y1", "y2"]) if (k in c) c[k] = -c[k];
  const bb = p.getBoundingBox();
  out.lines.push({ text, d: p.toPathData(3), bbox: bb });
}
fs.mkdirSync(path.join(root, "public/data"), { recursive: true });
fs.writeFileSync(path.join(root, "public/data/wordmark.json"), JSON.stringify(out));
console.log(out.lines.map((l) => `${l.text}: ${(l.bbox.x2 - l.bbox.x1).toFixed(1)} x ${(l.bbox.y2 - l.bbox.y1).toFixed(1)}`).join("\n"), "cap", out.capHeight.toFixed(1));
