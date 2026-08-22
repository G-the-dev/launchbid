// Dodo Payments config. Packs live in DODO_PACKS env as JSON:
// [{"usd":1,"tokens":90,"productId":"pdt_..."}, ...] (scripts/dodo-setup.mjs prints it)
export type DodoPack = { usd: number; tokens: number; productId: string };

export function getDodoPacks(): DodoPack[] {
  try {
    const packs = JSON.parse(process.env.DODO_PACKS ?? "[]") as DodoPack[];
    return packs.filter((p) => p.usd > 0 && p.tokens > 0 && !!p.productId);
  } catch {
    return [];
  }
}

export function dodoBase(): string {
  return (process.env.DODO_ENV ?? "test") === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}
