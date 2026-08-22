// Procedural blocky character faces: every product gets a unique, permanent
// 8x8 pixel villager generated from its slug. Original characters in the
// blocky spirit (varied skin tones, hair, eyes, outfits), transparent bg.

const SKINS = [
  "#f9c9a3", "#eab07f", "#c98a5b", "#a06a42", "#7a4b2a", // human range
  "#6fbf4f", "#7da05a", "#9aa2ad", "#a06fd1", "#6f9fd1", // creature range
  "#d1b36f", "#e79ac2",
];
const HAIRS = ["#2b2620", "#5a3d26", "#d9b45a", "#b5502e", "#e8e6e0", "#4b6fd1", "#3f8f4f", "#7a4bb5"];
const SHIRTS = ["#b3402e", "#3e6f96", "#46a32e", "#7d5bb8", "#b8860b", "#4f4f57", "#c46a9e", "#2e8f8f"];
const PUPILS = ["#2b3f8f", "#3f6f2b", "#5a3d26", "#1d1d21", "#8f2b2b", "#2e8f8f"];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function PixelFace({ seed, size }: { seed: string; size: number }) {
  const h = hash(seed);
  const skin = SKINS[h % SKINS.length];
  const hair = HAIRS[(h >>> 4) % HAIRS.length];
  const shirt = SHIRTS[(h >>> 8) % SHIRTS.length];
  const pupil = PUPILS[(h >>> 12) % PUPILS.length];
  const hairStyle = (h >>> 16) % 6; // 0 flat, 1 short, 2 side, 3 mohawk, 4 hood, 5 bald
  const eyeStyle = (h >>> 19) % 3; // 0 open, 1 squint, 2 visor
  const mouthStyle = (h >>> 21) % 3; // 0 small, 1 wide, 2 smile
  const skinDark = shade(skin, 0.78);

  // 8x8 grid: null = transparent
  const g: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  // head rows 1..6 full width, ears shading at edges
  for (let y = 1; y <= 6; y++) for (let x = 0; x < 8; x++) g[y][x] = skin;
  g[1][0] = skinDark; g[1][7] = skinDark;
  // outfit row
  for (let x = 0; x < 8; x++) g[7][x] = shirt;
  g[7][0] = shade(shirt, 0.75); g[7][7] = shade(shirt, 0.75);

  // hair
  if (hairStyle === 0) for (let x = 0; x < 8; x++) { g[0][x] = hair; g[1][x] = hair; }
  else if (hairStyle === 1) for (let x = 0; x < 8; x++) g[0][x] = hair;
  else if (hairStyle === 2) { for (let x = 0; x < 8; x++) g[0][x] = hair; g[1][0] = hair; g[1][1] = hair; g[2][0] = hair; }
  else if (hairStyle === 3) { g[0][3] = hair; g[0][4] = hair; g[1][3] = hair; g[1][4] = hair; }
  else if (hairStyle === 4) { for (let x = 0; x < 8; x++) { g[0][x] = hair; g[1][x] = hair; } g[2][0] = hair; g[2][7] = hair; g[3][0] = hair; g[3][7] = hair; }
  // 5 = bald

  // eyes on row 3-4
  if (eyeStyle === 2) {
    for (let x = 1; x <= 6; x++) g[3][x] = "#1d1d21"; // visor
  } else {
    if (eyeStyle === 0) { g[3][1] = "#ffffff"; g[3][6] = "#ffffff"; }
    g[3][2] = pupil; g[3][5] = pupil;
  }

  // mouth on row 5
  if (mouthStyle === 0) { g[5][3] = skinDark; g[5][4] = skinDark; }
  else if (mouthStyle === 1) { for (let x = 2; x <= 5; x++) g[5][x] = skinDark; }
  else { g[5][3] = skinDark; g[5][4] = skinDark; g[4][2] = skinDark; g[4][5] = skinDark; }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
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
