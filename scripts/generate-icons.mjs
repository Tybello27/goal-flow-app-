#!/usr/bin/env node
/**
 * GoalFlow PWA asset generator.
 *
 * Renders the GoalFlow mark (a target with a golden check hitting the bullseye,
 * on a blue→emerald gradient) into every icon the PWA needs:
 *
 *   public/favicon.svg          vector favicon
 *   public/favicon.ico          16px + 32px PNGs inside a real ICO container
 *   public/apple-touch-icon.png 180×180 (flattened — Apple ignores alpha)
 *   public/icon-192.png         192×192 manifest icon (purpose "any")
 *   public/icon-512.png         512×512 manifest icon (purpose "any")
 *   public/maskable-icon.png    512×512 full-bleed, artwork inside the safe zone
 *
 * Runs automatically via `npm run prebuild`; can also be run directly:
 *   node scripts/generate-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const GRADIENT = `
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="55%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#10b981"/>
  </linearGradient>`;

/** The mark, drawn on a 512×512 grid. `scale` shrinks it toward the center. */
function artwork(scale = 1) {
  const t = scale === 1 ? '' : ` transform="translate(${512 * (1 - scale) / 2},${512 * (1 - scale) / 2}) scale(${scale})"`;
  return `
  <g${t}>
    <circle cx="402" cy="106" r="158" fill="#ffffff" opacity="0.09"/>
    <circle cx="112" cy="418" r="122" fill="#ffffff" opacity="0.08"/>
    <circle cx="256" cy="256" r="132" fill="none" stroke="#ffffff" stroke-width="32"/>
    <circle cx="256" cy="256" r="68" fill="none" stroke="#ffffff" stroke-width="30" opacity="0.9"/>
    <path d="M222 262 L252 292 L306 226" fill="none" stroke="#fbbf24" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="322" cy="208" r="14" fill="#fbbf24"/>
  </g>`;
}

function svg({ masked = false } = {}) {
  const rx = masked ? 0 : 112;
  const scale = masked ? 0.8 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>${GRADIENT}</defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#bg)"/>
  ${artwork(scale)}
</svg>`;
}

/** Wrap PNG buffers in a minimal, fully-valid ICO container. */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  const payloads = [];
  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // payload size
    entry.writeUInt32LE(offset, 10); // payload offset
    entries.push(entry);
    payloads.push(png);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...payloads]);
}

async function raster(svgString, size, { flatten = false } = {}) {
    let img = sharp(Buffer.from(svgString), { density: 384 }).resize(size, size, { fit: 'contain' });
  if (flatten) img = img.flatten({ background: '#2563eb' });
  return img.png().toBuffer();
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  const base = svg();
  const masked = svg({ masked: true });

  console.log('· favicon.svg');
  await writeFile(join(PUBLIC, 'favicon.svg'), base, 'utf8');

  console.log('· favicon.ico (16 + 32)');
  const ico = buildIco([
    { size: 16, png: await raster(base, 16) },
    { size: 32, png: await raster(base, 32) },
  ]);
  await writeFile(join(PUBLIC, 'favicon.ico'), ico);

  console.log('· apple-touch-icon.png (180)');
  await writeFile(join(PUBLIC, 'apple-touch-icon.png'), await raster(base, 180, { flatten: true }));

  console.log('· icon-192.png');
  await writeFile(join(PUBLIC, 'icon-192.png'), await raster(base, 192));

  console.log('· icon-512.png');
  await writeFile(join(PUBLIC, 'icon-512.png'), await raster(base, 512));

  console.log('· maskable-icon.png (safe zone)');
  await writeFile(join(PUBLIC, 'maskable-icon.png'), await raster(masked, 512, { flatten: true }));

  console.log('✔ GoalFlow PWA assets generated in public/');
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
