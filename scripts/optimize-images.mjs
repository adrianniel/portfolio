// Turns the raw images in assets-raw/ (gitignored) into small AVIF/WebP files
// in public/img/ and writes their sizes to src/data/images.ts.
//
//   node scripts/optimize-images.mjs
//
// assets-raw/
//   niel.png                  -> portrait cut out of its background (RGBA),
//                                ink/cream duotone, trimmed to the figure
//   projects/<slug>.(png|jpg) -> project previews (16:10 crop)
//   certificates/<slug>.*     -> certificates (kept whole)

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAW = "assets-raw";
const OUT = "public/img";
const MANIFEST = "src/data/images.ts";

const INK = [0x16, 0x13, 0x0f];
const CREAM = [0xf2, 0xeb, 0xdc];

const groups = [
  { dir: "", match: /^niel\./, widths: [480, 960], duotone: true },
  { dir: "projects", widths: [720, 1440], aspect: 16 / 10 },
  { dir: "certificates", widths: [600, 1400] },
];

/**
 * Maps luminance onto a gradient from ink (shadows) to cream (highlights).
 * Keeps transparency, and for a cut-out trims the empty space around the
 * figure (a few pixels of air on the sides, none on top, so whatever stands
 * on the image's top edge stands on the head).
 */
async function duotone(input) {
  const meta = await sharp(input).metadata();
  const { data, info } = await sharp(input)
    .removeAlpha()
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alpha = meta.hasAlpha
    ? await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer()
    : Buffer.alloc(data.length, 255);

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const t = Math.pow(data[i] / 255, 0.9);
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(INK[c] + (CREAM[c] - INK[c]) * t);
    out[i * 4 + 3] = alpha[i];
  }
  let img = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
  if (!meta.hasAlpha) return { buffer: await img.png().toBuffer() };

  // Bounding box of the figure.
  let top = info.height, bottom = 0, left = info.width, right = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (alpha[y * info.width + x] > 12) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
  const side = Math.round((right - left) * 0.04);
  left = Math.max(0, left - side);
  right = Math.min(info.width - 1, right + side);
  const width = right - left + 1;
  const height = bottom - top + 1;

  // Where the head peaks: the first row with a solid stretch wide enough to
  // stand on (not a stray strand), and the middle of that stretch.
  let perchX = 0.5;
  let perchY = 0;
  const minRun = Math.max(8, Math.round(width * 0.025));
  for (let y = top; y <= bottom; y++) {
    let best = [0, 0];
    let start = -1;
    for (let x = left; x <= right + 1; x++) {
      const solid = x <= right && alpha[y * info.width + x] > 200;
      if (solid && start < 0) start = x;
      if (!solid && start >= 0) {
        if (x - start > best[1] - best[0]) best = [start, x];
        start = -1;
      }
    }
    if (best[1] - best[0] >= minRun) {
      perchX = ((best[0] + best[1]) / 2 - left) / width;
      perchY = (y - top) / width; // as a share of the width: it scales with it
      break;
    }
  }
  img = img.extract({ left, top, width, height });
  return {
    buffer: await img.png().toBuffer(),
    perchX: Math.round(perchX * 1000) / 1000,
    perchY: Math.round(perchY * 1000) / 1000,
  };
}

const manifest = {};

for (const group of groups) {
  const src = path.join(RAW, group.dir);
  if (!existsSync(src)) continue;
  const files = (await readdir(src)).filter(
    (f) => /\.(png|jpe?g|webp)$/i.test(f) && (!group.match || group.match.test(f)),
  );
  const outDir = path.join(OUT, group.dir);
  await mkdir(outDir, { recursive: true });

  for (const file of files) {
    const slug = path.parse(file).name;
    let input = path.join(src, file);
    let perchX, perchY;
    if (group.duotone) ({ buffer: input, perchX, perchY } = await duotone(input));

    const meta = await sharp(input).metadata();
    let width = meta.width;
    let height = meta.height;
    if (group.aspect) height = Math.round(width / group.aspect);

    const sources = [];
    for (const w of group.widths) {
      const target = Math.min(w, width);
      const h = Math.round((target / width) * height);
      let img = sharp(input);
      img = group.aspect
        ? img.resize(target, h, { fit: "cover", position: "top" })
        : img.resize(target);
      const base = path.join(outDir, `${slug}-${target}`);
      await img.clone().avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
      await img.clone().webp({ quality: 78 }).toFile(`${base}.webp`);
      sources.push(target);
      if (target === width) break;
    }

    const key = group.dir ? `${group.dir}/${slug}` : slug;
    manifest[key] = {
      base: `img/${group.dir ? `${group.dir}/` : ""}${slug}`,
      widths: [...new Set(sources)],
      width,
      height,
      ...(perchX !== undefined ? { perchX, perchY } : {}),
    };
    console.log(`✓ ${key} → ${sources.join(", ")}w`);
  }
}

const body = `// Generated by scripts/optimize-images.mjs. Do not edit by hand.

export type ImageAsset = {
  /** Path under public/ without the "-<width>.<ext>" suffix. */
  base: string
  widths: number[]
  width: number
  height: number
  /** For cut-outs: how far across the top edge the head peaks (0 to 1). */
  perchX?: number
  /** For cut-outs: how far below the top edge the head starts, as a share of the width. */
  perchY?: number
}

export const images = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<string, ImageAsset>

export type ImageKey = keyof typeof images
`;
await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, body);
console.log(`wrote ${MANIFEST}`);
