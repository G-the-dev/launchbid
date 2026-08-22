// Procedural blocky character heads, v2: 16x16 grid with skin dithering,
// side shading, noses, beards, hair layers, hats, and themed variants
// (villager, undead, robot, golden). Deterministic per seed, so every
// product keeps its face forever. Premium: bid totals unlock accessories
// (tier 1 at 50+ tokens) and gold treatment with a crown (tier 2 at 200+).
// Original characters in the blocky spirit; transparent background.

type Theme = "villager" | "undead" | "robot" | "golden";

const THEME_SKINS: Record<Theme, string[]> = {
  villager: ["#f9c9a3", "#eab07f", "#c98a5b", "#a06a42", "#7a4b2a", "#e79ac2", "#a06fd1", "#6f9fd1"],
  undead: ["#7da05a", "#6fbf4f", "#8a9a6a", "#9aa2ad"],
  robot: ["#9aa2ad", "#7f8d99", "#b8c4cf"],
  golden: ["#d1b36f", "#e0c37f", "#c9a95f"],
};
const HAIRS = ["#2b2620", "#5a3d26", "#d9b45a", "#b5502e", "#e8e6e0", "#4b6fd1", "#3f8f4f", "#7a4bb5"];
const SHIRTS = ["#b3402e", "#3e6f96", "#46a32e", "#7d5bb8", "#b8860b", "#4f4f57", "#c46a9e", "#2e8f8f"];
const PUPILS = ["#2b3f8f", "#3f6f2b", "#5a3d26", "#1d1d21", "#8f2b2b", "#2e8f8f"];
const GOLD = "#ffd83d";
const GOLD_DARK = "#b8860b";

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// deterministic PRNG so dithering is stable per seed
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function PixelFace({
  seed,
  size,
  tokens = 0,
}: {
  seed: string;
  size: number;
  tokens?: number;
}) {
  const rnd = mulberry32(hash(seed));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const chance = (p: number) => rnd() < p;
  const tier = tokens >= 200 ? 2 : tokens >= 50 ? 1 : 0;

  // theme: gold tier forces golden; otherwise weighted
  const roll = rnd();
  const theme: Theme =
    tier === 2 ? "golden" : roll < 0.62 ? "villager" : roll < 0.78 ? "undead" : roll < 0.92 ? "robot" : "golden";

  const skin = pick(THEME_SKINS[theme]);
  const skinDark = shade(skin, 0.8);
  const skinDarker = shade(skin, 0.62);
  const skinLight = shade(skin, 1.15);
  const hair = theme === "robot" ? shade(skin, 0.5) : pick(HAIRS);
  const hairDark = shade(hair, 0.72);
  const shirt = pick(SHIRTS);
  const pupil = theme === "undead" ? "#8f2b2b" : theme === "robot" ? "#2e8f8f" : pick(PUPILS);

  const hairStyle = Math.floor(rnd() * 8); // flat/short/side/mohawk/long/bangs/bald/hood
  const eyeStyle = theme === "robot" && chance(0.6) ? 2 : Math.floor(rnd() * 2); // 0 open, 1 squint, 2 visor
  const mouthStyle = Math.floor(rnd() * (theme === "undead" ? 5 : 4)); // line/wide/smile/frown/fangs
  const hasNose = theme !== "robot" && chance(0.55);
  const hasBeard = theme === "villager" && hairStyle !== 7 && chance(0.3);
  // hats: tier 2 always crowned; tier 1 gets one; otherwise 30%
  const hatStyle =
    tier === 2 ? 1 : tier === 1 ? 2 + Math.floor(rnd() * 4) : chance(0.3) ? 1 + Math.floor(rnd() * 5) : 0;
  // 0 none, 1 crown, 2 cap, 3 beanie, 4 headband, 5 antenna(+robot)

  const S = 16;
  const g: (string | null)[][] = Array.from({ length: S }, () => Array(S).fill(null));
  const put = (x: number, y: number, c: string) => {
    if (x >= 0 && x < S && y >= 0 && y < S) g[y][x] = c;
  };
  const rect = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c);
  };

  // --- head base with shading + dither texture ---
  rect(1, 2, 14, 13, skin);
  for (let y = 2; y <= 13; y++) { put(1, y, skinDark); put(14, y, skinDark); }
  rect(2, 13, 13, 13, skinDark); // jaw shadow
  rect(2, 2, 13, 2, skinLight); // forehead highlight
  for (let y = 3; y <= 12; y++)
    for (let x = 2; x <= 13; x++)
      if (chance(0.09)) put(x, y, chance(0.5) ? skinDark : skinLight); // texture

  // robot rivets + seam
  if (theme === "robot") {
    put(2, 3, skinDarker); put(13, 3, skinDarker); put(2, 12, skinDarker); put(13, 12, skinDarker);
    rect(7, 12, 8, 13, skinDarker);
  }

  // --- hair ---
  const hairPx = (x: number, y: number) => put(x, y, chance(0.18) ? hairDark : hair);
  if (hairStyle === 0) { for (let y = 0; y <= 3; y++) for (let x = 1; x <= 14; x++) hairPx(x, y); rect(1, 4, 2, 5, hair); rect(13, 4, 14, 5, hair); }
  else if (hairStyle === 1) { for (let y = 1; y <= 3; y++) for (let x = 1; x <= 14; x++) hairPx(x, y); }
  else if (hairStyle === 2) { for (let y = 0; y <= 3; y++) for (let x = 1; x <= 14; x++) hairPx(x, y); for (let y = 4; y <= 7; y++) { hairPx(1, y); hairPx(2, y); } }
  else if (hairStyle === 3) { for (let y = 0; y <= 3; y++) for (let x = 6; x <= 9; x++) hairPx(x, y); }
  else if (hairStyle === 4) { for (let y = 0; y <= 3; y++) for (let x = 1; x <= 14; x++) hairPx(x, y); for (let y = 4; y <= 11; y++) { hairPx(1, y); hairPx(2, y); hairPx(13, y); hairPx(14, y); } }
  else if (hairStyle === 5) { for (let y = 0; y <= 2; y++) for (let x = 1; x <= 14; x++) hairPx(x, y); for (let x = 1; x <= 14; x += 2) hairPx(x, 3); }
  else if (hairStyle === 7) { for (let y = 0; y <= 4; y++) for (let x = 0; x <= 15; x++) hairPx(x, y); for (let y = 5; y <= 13; y++) { hairPx(0, y); hairPx(1, y); hairPx(14, y); hairPx(15, y); } }
  // 6 = bald

  // --- hats (drawn over hair) ---
  if (hatStyle === 1) { // crown
    rect(2, 1, 13, 1, GOLD);
    for (let x = 2; x <= 13; x += 3) put(x, 0, GOLD);
    put(7, 1, "#b3402e"); put(8, 1, "#b3402e"); // jewels
    rect(2, 2, 13, 2, GOLD_DARK);
  } else if (hatStyle === 2) { // cap
    const cap = pick(SHIRTS);
    rect(1, 0, 14, 2, cap);
    rect(1, 3, 8, 3, shade(cap, 0.75)); // brim
  } else if (hatStyle === 3) { // beanie
    const bean = pick(SHIRTS);
    rect(1, 0, 14, 2, bean);
    rect(1, 3, 14, 3, shade(bean, 1.25));
  } else if (hatStyle === 4) { // headband
    rect(1, 4, 14, 4, tier >= 1 ? GOLD : pick(SHIRTS));
  } else if (hatStyle === 5) { // antenna
    rect(7, 0, 8, 1, skinDarker);
    put(7, 0, "#ff5555"); put(8, 0, "#ff5555");
  }

  // --- eyes (rows 6-7) ---
  if (eyeStyle === 2) {
    rect(2, 6, 13, 7, "#1d1d21");
    rect(3, 6, 12, 6, "#2e8f8f"); // glow line
  } else {
    if (eyeStyle === 0 && theme !== "undead") {
      rect(3, 6, 5, 7, "#ffffff"); rect(10, 6, 12, 7, "#ffffff");
      rect(4, 6, 5, 7, pupil); rect(10, 6, 11, 7, pupil);
    } else {
      rect(4, 7, 5, 7, pupil); rect(10, 7, 11, 7, pupil);
      if (theme === "undead") { rect(4, 6, 5, 6, skinDarker); rect(10, 6, 11, 6, skinDarker); } // sockets
    }
  }

  // --- nose (rows 8-9) ---
  if (hasNose) { rect(7, 8, 8, 9, skinDark); put(7, 9, skinDarker); }

  // --- mouth (rows 10-12) ---
  if (mouthStyle === 0) rect(6, 11, 9, 11, skinDarker);
  else if (mouthStyle === 1) rect(5, 11, 10, 11, skinDarker);
  else if (mouthStyle === 2) { put(5, 10, skinDarker); put(10, 10, skinDarker); rect(6, 11, 9, 11, skinDarker); }
  else if (mouthStyle === 3) { rect(6, 10, 9, 10, skinDarker); put(5, 11, skinDarker); put(10, 11, skinDarker); }
  else { rect(5, 11, 10, 11, skinDarker); put(6, 12, "#ffffff"); put(9, 12, "#ffffff"); } // fangs

  // --- beard ---
  if (hasBeard) {
    rect(3, 12, 12, 13, hair);
    for (let x = 3; x <= 12; x++) if (chance(0.3)) put(x, 12, hairDark);
    rect(5, 11, 5, 11, hair); rect(10, 11, 10, 11, hair); // moustache tips
  }

  // --- outfit (rows 14-15) ---
  rect(1, 14, 14, 15, shirt);
  rect(1, 14, 2, 15, shade(shirt, 0.72));
  rect(13, 14, 14, 15, shade(shirt, 0.72));
  rect(7, 14, 8, 14, tier >= 1 ? GOLD : shade(shirt, 1.3)); // collar/medal
  if (tier === 2) rect(1, 15, 14, 15, GOLD_DARK); // gold trim

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden
      shapeRendering="crispEdges"
      className="shrink-0"
      style={{ imageRendering: "pixelated" }}
    >
      {g.flatMap((row, y) =>
        row.map((color, x) =>
          color ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null
        )
      )}
    </svg>
  );
}
