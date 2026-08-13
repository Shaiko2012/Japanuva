/**
 * Generate Android launcher / splash assets from the Japanuva torii mark.
 * Usage: node scripts/generate-android-branding.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const res = join(root, "android", "app", "src", "main", "res");
const MINT = "#ADEBB3";
const INK = "#0A0A0A";
const PARCHMENT = "#FAF8F2";

function toriiSvg(size, { background }) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  ${background}
  <g fill="${INK}" transform="translate(64 64) scale(0.66) translate(-64 -76)">
    <path d="M18 34h92l5 12H13z"/>
    <rect x="24" y="48" width="80" height="7" rx="1"/>
    <rect x="36" y="48" width="11" height="70" rx="1.5"/>
    <rect x="81" y="48" width="11" height="70" rx="1.5"/>
    <rect x="36" y="84" width="56" height="8" rx="1"/>
  </g>
</svg>`);
}

async function png(svg, size) {
  return sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

async function write(dir, name, buf) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), buf);
  console.log("wrote", join(dir, name).replace(root + "\\", ""));
}

async function main() {
  const circle = (s) =>
    toriiSvg(s, { background: `<circle cx="64" cy="64" r="64" fill="${MINT}"/>` });
  const square = (s) =>
    toriiSvg(s, { background: `<rect width="128" height="128" fill="${MINT}"/>` });
  const transparent = (s) =>
    toriiSvg(s, { background: `<rect width="128" height="128" fill="none"/>` });

  const launcher = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
  };
  for (const [folder, size] of Object.entries(launcher)) {
    const buf = await png(square(size * 4), size);
    await write(join(res, folder), "ic_launcher.png", buf);
    await write(join(res, folder), "ic_launcher_round.png", await png(circle(size * 4), size));
    const fg = await png(transparent(size * 4), Math.round(size * 2.25));
    await write(join(res, folder), "ic_launcher_foreground.png", fg);
  }

  const splashIcon = await png(circle(1024), 288);
  await write(join(res, "drawable"), "splash_icon.png", splashIcon);
  await write(join(res, "drawable-xxhdpi"), "splash_icon.png", splashIcon);

  const splashCanvas = 1280;
  const mark = 420;
  const splashSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${splashCanvas}" height="${splashCanvas}" viewBox="0 0 ${splashCanvas} ${splashCanvas}">
  <rect width="100%" height="100%" fill="${PARCHMENT}"/>
  <svg x="${(splashCanvas - mark) / 2}" y="${(splashCanvas - mark) / 2}" width="${mark}" height="${mark}" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="64" fill="${MINT}"/>
    <g fill="${INK}" transform="translate(64 64) scale(0.66) translate(-64 -76)">
      <path d="M18 34h92l5 12H13z"/>
      <rect x="24" y="48" width="80" height="7" rx="1"/>
      <rect x="36" y="48" width="11" height="70" rx="1.5"/>
      <rect x="81" y="48" width="11" height="70" rx="1.5"/>
      <rect x="36" y="84" width="56" height="8" rx="1"/>
    </g>
  </svg>
</svg>`);
  const splash = await sharp(splashSvg).png({ compressionLevel: 9 }).toBuffer();
  await write(join(res, "drawable"), "splash.png", splash);

  const densities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];
  for (const d of densities) {
    await write(join(res, `drawable-port-${d}`), "splash.png", splash);
    await write(join(res, `drawable-land-${d}`), "splash.png", splash);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
