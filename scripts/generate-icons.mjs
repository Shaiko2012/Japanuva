/**
 * Generate Japanuva PWA / favicon PNGs from the mint + torii mark.
 * Usage: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const appDir = join(root, "src", "app");

const MINT = "#ADEBB3";
const INK = "#0A0A0A";

/** Same geometry as LogoMark.tsx — ink torii on mint disc. */
function toriiMarkSvg(size, { circle = true, roundedSquare = false } = {}) {
  const s = size / 128;
  const bg = circle
    ? `<circle cx="64" cy="64" r="64" fill="${MINT}"/>`
    : roundedSquare
      ? `<rect width="128" height="128" rx="24" fill="${MINT}"/>`
      : `<rect width="128" height="128" fill="${MINT}"/>`;
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  ${bg}
  <g fill="${INK}" transform="translate(64 64) scale(0.66) translate(-64 -76)">
    <path d="M18 34h92l5 12H13z"/>
    <rect x="24" y="48" width="80" height="7" rx="1"/>
    <rect x="36" y="48" width="11" height="70" rx="1.5"/>
    <rect x="81" y="48" width="11" height="70" rx="1.5"/>
    <rect x="36" y="84" width="56" height="8" rx="1"/>
  </g>
</svg>`);
}

function pngToIco(pngBuffer, size = 32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

async function png(svg, size) {
  return sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

async function writePng(svg, size, dir, name) {
  const buf = await png(svg, size);
  writeFileSync(join(dir, name), buf);
  console.log(`wrote ${name} (${size}x${size})`);
  return buf;
}

async function main() {
  const circle = toriiMarkSvg(512, { circle: true });
  const square = toriiMarkSvg(512, { circle: false });
  const maskable = toriiMarkSvg(512, { circle: false });

  await writePng(square, 192, publicDir, "icon-192.png");
  await writePng(square, 512, publicDir, "icon-512.png");
  await writePng(maskable, 512, publicDir, "icon-512-maskable.png");
  const apple = await writePng(circle, 180, publicDir, "apple-touch-icon.png");
  const fav32 = await writePng(circle, 32, publicDir, "favicon-32.png");

  writeFileSync(join(appDir, "apple-icon.png"), apple);
  writeFileSync(join(appDir, "icon.png"), apple);

  const ico = pngToIco(fav32, 32);
  writeFileSync(join(publicDir, "favicon.ico"), ico);
  writeFileSync(join(appDir, "favicon.ico"), ico);
  console.log("wrote favicon.ico");

  const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Japanuva">
  <circle cx="64" cy="64" r="64" fill="${MINT}"/>
  <g fill="${INK}" transform="translate(64 64) scale(0.66) translate(-64 -76)">
    <path d="M18 34h92l5 12H13z"/>
    <rect x="24" y="48" width="80" height="7" rx="1"/>
    <rect x="36" y="48" width="11" height="70" rx="1.5"/>
    <rect x="81" y="48" width="11" height="70" rx="1.5"/>
    <rect x="36" y="84" width="56" height="8" rx="1"/>
  </g>
</svg>
`;
  writeFileSync(join(publicDir, "logo.svg"), logoSvg);
  writeFileSync(join(publicDir, "icon.svg"), logoSvg);
  console.log("wrote logo.svg and icon.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
