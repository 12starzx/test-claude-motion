// Rend les trois plans de la plaque (fond transparent) dans out/raw/.
// Usage : node scripts/render.mjs [taille=2400] [vue1,vue2,...]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const size = Number(process.argv[2] ?? 2400);
const views = (process.argv[3] ?? "front,three-quarter,side").split(",");
const outDir = path.join(root, "out/raw");
fs.mkdirSync(outDir, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/public/index.html`;

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
try {
  for (const view of views) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    page.on("console", (m) => m.type() === "error" && console.error(`[${view}]`, m.text()));
    await page.goto(`${base}?view=${view}&size=${size}`);
    await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 300_000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error(`${view}: ${err}`);
    const dataUrl = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png"));
    fs.writeFileSync(path.join(outDir, `${view}.png`), Buffer.from(dataUrl.split(",")[1], "base64"));
    console.log(`${view}.png`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
