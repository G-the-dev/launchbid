// Generates the LaunchBid brand kit: mark + wordmark logo, with and without
// background, SVG and PNG. Wordmark is converted to vector outlines from
// Minecraft.ttf so the SVGs render everywhere without the font installed.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import opentype from "opentype.js";
import sharp from "sharp";

const OUT = new URL("../brand/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const buf = readFileSync(new URL("../src/fonts/Minecraft.ttf", import.meta.url));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const SIZE = 96;
const WHITE = "#fafafa";
const GOLD = "#ffd83d";
const DARK = "#17171b";

// --- the grass-block mark (16x16 pixel grid, from the site logo) ---
const MARK_RECTS = [
  [0, 0, 16, 16, "#79553a"],
  [2, 7, 2, 2, "#5e4127"],
  [7, 10, 2, 2, "#5e4127"],
  [12, 8, 2, 2, "#8a6142"],
  [4, 13, 2, 2, "#8a6142"],
  [0, 0, 16, 5, "#5bba3a"],
  [0, 4, 2, 2, "#5bba3a"],
  [6, 4, 3, 2, "#5bba3a"],
  [12, 4, 2, 2, "#5bba3a"],
  [2, 1, 2, 2, "#4a9e2d"],
  [9, 2, 3, 1, "#4a9e2d"],
  [13, 0, 2, 2, "#6fd14b"],
];
const markGroup = (x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 16})" shape-rendering="crispEdges">` +
  MARK_RECTS.map(([rx, ry, w, h, f]) => `<rect x="${rx}" y="${ry}" width="${w}" height="${h}" fill="${f}"/>`).join("") +
  `</g>`;

// --- wordmark outlines ---
const launch = font.getPath("Launch", 0, 0, SIZE);
const advLaunch = font.getAdvanceWidth("Launch", SIZE);
const bid = font.getPath("Bid", advLaunch + SIZE * 0.04, 0, SIZE);
const b1 = launch.getBoundingBox();
const b2 = bid.getBoundingBox();
const wordTop = Math.min(b1.y1, b2.y1);
const wordBottom = Math.max(b1.y2, b2.y2);
const wordH = wordBottom - wordTop;
const wordW = Math.max(b1.x2, b2.x2);

// --- compose logo (mark + wordmark), vertically centered ---
const MARK_H = wordH * 1.25;
const GAP = MARK_H * 0.35;
const PAD = 8;
const totalW = MARK_H + GAP + wordW + PAD * 2;
const totalH = MARK_H + PAD * 2;
const wordY = PAD + MARK_H / 2 - wordTop - wordH / 2;
const wordX = PAD + MARK_H + GAP;

const wordPaths = (dx, dy) =>
  `<path transform="translate(${dx} ${dy})" d="${launch.toPathData(2)}" fill="${WHITE}"/>` +
  `<path transform="translate(${dx} ${dy})" d="${bid.toPathData(2)}" fill="${GOLD}"/>`;

const svg = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${inner}</svg>`;

const logoInner = markGroup(PAD, PAD, MARK_H) + wordPaths(wordX, wordY);
const logoSvg = svg(totalW, totalH, logoInner);

const BPAD = MARK_H * 0.45;
const bgW = totalW - PAD * 2 + BPAD * 2;
const bgH = totalH - PAD * 2 + BPAD * 2;
const logoDarkSvg = svg(
  bgW, bgH,
  `<rect width="${bgW}" height="${bgH}" rx="${BPAD * 0.5}" fill="${DARK}"/>` +
  markGroup(BPAD, BPAD, MARK_H) +
  wordPaths(BPAD + MARK_H + GAP - PAD, wordY + BPAD - PAD)
);

const markSvg = svg(16, 16, markGroup(0, 0, 16));
const markDarkSvg = svg(
  22, 22,
  `<rect width="22" height="22" rx="4" fill="${DARK}"/>` + markGroup(3, 3, 16)
);

writeFileSync(new URL("logo.svg", OUT), logoSvg);
writeFileSync(new URL("logo-dark.svg", OUT), logoDarkSvg);
writeFileSync(new URL("mark.svg", OUT), markSvg);
writeFileSync(new URL("mark-dark.svg", OUT), markDarkSvg);

const png = (svgStr, name, opts) =>
  sharp(Buffer.from(svgStr), { density: 300 }).resize(opts).png().toFile(new URL(name, OUT).pathname.slice(1));

await Promise.all([
  png(markSvg, "mark-512.png", { width: 512, kernel: "nearest" }),
  png(markSvg, "favicon-64.png", { width: 64, kernel: "nearest" }),
  png(markSvg, "favicon-256.png", { width: 256, kernel: "nearest" }),
  png(markDarkSvg, "mark-dark-512.png", { width: 512, kernel: "nearest" }),
  png(logoSvg, "logo-1600.png", { width: 1600 }),
  png(logoSvg, "logo-800.png", { width: 800 }),
  png(logoDarkSvg, "logo-dark-1600.png", { width: 1600 }),
]);
console.log("brand kit written to brand/");
