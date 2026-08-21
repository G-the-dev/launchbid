export const MIN_BOOST_TOKENS = 5;
export const BOOST_PRESETS_TOKENS = [10, 50, 250];

export const WELCOME_TOKENS = 25; // first product listed (enforced once in DB)
export const SHARE_X_TOKENS = 50; // share on X (once per user)
export const VISIT_TOKENS = 2; // per site visited, max 10 rewarded visits/day

export const TOKEN_PACKS = [
  { inr: 49, tokens: 50 },
  { inr: 99, tokens: 110 },
  { inr: 199, tokens: 240 },
  { inr: 499, tokens: 650 },
] as const;

export function formatTokens(n: number): string {
  return `${new Intl.NumberFormat("en-IN").format(n)} ⚡`;
}

export function upiPayUri(vpa: string, amountInr: number): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: "LaunchBid",
    am: String(amountInr),
    cu: "INR",
    tn: "LaunchBid tokens",
  });
  return `upi://pay?${params.toString()}`;
}
