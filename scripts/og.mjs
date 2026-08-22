// Builds the 1200x630 social preview image from the brand assets.
import { readFileSync, writeFileSync } from "fs";
import opentype from "opentype.js";
import sharp from "sharp";

const buf = readFileSync(new URL("../src/fonts/Minecraft.ttf", import.meta.url));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const MARK = `<g transform="translate(80 215) scale(12.5)" shape-rendering="crispEdges">
<rect width="16" height="16" fill="#79553a"/><rect x="2" y="7" width="2" height="2" fill="#5e4127"/>
<rect x="7" y="10" width="2" height="2" fill="#5e4127"/><rect x="12" y="8" width="2" height="2" fill="#8a6142"/>
<rect x="4" y="13" width="2" height="2" fill="#8a6142"/><rect width="16" height="5" fill="#5bba3a"/>
<rect x="0" y="4" width="2" height="2" fill="#5bba3a"/><rect x="6" y="4" width="3" height="2" fill="#5bba3a"/>
<rect x="12" y="4" width="2" height="2" fill="#5bba3a"/><rect x="2" y="1" width="2" height="2" fill="#4a9e2d"/>
<rect x="9" y="2" width="3" height="1" fill="#4a9e2d"/><rect x="13" y="0" width="2" height="2" fill="#6fd14b"/></g>`;

const text = (str, x, y, size, fill) =>
  `<path transform="translate(${x} ${y})" d="${font.getPath(str, 0, 0, size).toPathData(2)}" fill="${fill}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#17171b"/>
<rect width="1200" height="630" fill="none" stroke="#2c2c33" stroke-width="8"/>
${MARK}
${text("Launch", 320, 300, 96, "#fafafa")}${text("Bid", 320 + font.getAdvanceWidth("Launch", 96) + 6, 300, 96, "#ffd83d")}
${text("BID YOUR PRODUCT TO #1", 320, 392, 40, "#c4c4cc")}
${text("Tokens are bids. Totals never reset.", 320, 452, 28, "#93939e")}
${text("launchbid.lol", 80, 560, 34, "#5bba3a")}
</svg>`;

await sharp(Buffer.from(svg), { density: 150 }).resize({ width: 1200 }).png().toFile("public/og.png");
console.log("og.png written");
