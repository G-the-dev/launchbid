import { Polar } from "@polar-sh/sdk";

// International token packs live in the POLAR_PACKS env var as JSON:
// [{"usd":1,"tokens":90,"productId":"..."}, ...]  (written by scripts/polar-setup.mjs)
export type IntlPack = { usd: number; tokens: number; productId: string };

export function getIntlPacks(): IntlPack[] {
  try {
    const packs = JSON.parse(process.env.POLAR_PACKS ?? "[]") as IntlPack[];
    return packs.filter((p) => p.usd > 0 && p.tokens > 0 && p.productId);
  } catch {
    return [];
  }
}

export function getPolar() {
  return new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN! });
}
