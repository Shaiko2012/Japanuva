/**
 * Generate Japanuva PWA / favicon PNGs from the mint + leaf SVG mark.
 * Usage: node scripts/generate-icons.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const MINT = "#ADEBB3";
const INK = "#0A0A0A";

/** Lucide leaf paths in 24x24 viewBox */
function leafGroup(strokeWidth, scale, rotate = -12) {
  const cx = 12;
  const cy = 12;
  return `
    <g
      fill="none"
      stroke="${INK}"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-linejoin="round"
      transform="translate(256 256) scale(${scale}) rotate(${rotate}) translate(${-cx} ${-cy})"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </g>`;
}

/** Full-bleed mint square with centered leaf (OS may round corners). */
function squareIconSvg(leafScale = 11.5, stroke = 2.35) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${MINT}"/>
  ${leafGroup(stroke, leafScale)}
</svg>`);
}

/** Circular mark on transparent (favicon / optional reuse). */
function circleIconSvg(leafScale = 11.2, stroke = 2.4) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="256" fill="${MINT}"/>
  ${leafGroup(stroke, leafScale)}
</svg>`);
}

/** Maskable: mint bleed + smaller leaf in safe zone (~80%). */
function maskableIconSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${MINT}"/>
  ${leafGroup(2.2, 8.8)}
</svg>`);
}

async function png(svg, size, outName) {
  const buf = await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  const out = join(publicDir, outName);
  writeFileSync(out, buf);
  console.log(`wrote ${outName} (${size}x${size}, ${buf.length} bytes)`);
}

async function main() {
  const square = squareIconSvg();
  const circle = circleIconSvg();
  const maskable = maskableIconSvg();

  await png(square, 192, "icon-192.png");
  await png(square, 512, "icon-512.png");
  await png(maskable, 512, "icon-512-maskable.png");
  await png(square, 180, "apple-touch-icon.png");
  await png(circle, 32, "favicon-32.png");

  // Also refresh public/icon.svg as square app icon source
  writeFileSync(
    join(publicDir, "icon.svg"),
    squareIconSvg().toString("utf8").replace('width="512" height="512" ', ""),
  );
  console.log("wrote icon.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
