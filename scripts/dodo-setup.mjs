// Creates the LaunchBid token packs as Dodo Payments products.
// Needs in .env.local:  DODO_API_KEY=...   DODO_ENV=test|live
// Run: node scripts/dodo-setup.mjs
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
);
const KEY = env.DODO_API_KEY;
if (!KEY) { console.error("Add DODO_API_KEY to .env.local first (Dodo dashboard > Developer > API Keys)."); process.exit(1); }
const BASE = (env.DODO_ENV ?? "test") === "live" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

// International packs (USD). UPI keeps serving India; adjust freely.
const PACKS = [
  { usd: 1, tokens: 90 },
  { usd: 3, tokens: 290 },
  { usd: 5, tokens: 500 },
  { usd: 10, tokens: 1050 },
];

const out = [];
for (const pack of PACKS) {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      name: `LaunchBid ${pack.tokens} tokens`,
      description: `${pack.tokens} bidding tokens for the LaunchBid leaderboard.`,
      tax_category: "digital_products",
      price: {
        type: "one_time_price",
        currency: "USD",
        price: pack.usd * 100,
        discount: 0,
        purchasing_power_parity: false,
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`FAIL $${pack.usd}: ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
    continue;
  }
  out.push({ usd: pack.usd, tokens: pack.tokens, productId: data.product_id ?? data.id });
  console.log(`created: $${pack.usd} -> ${pack.tokens} tokens (${data.product_id ?? data.id})`);
}
if (out.length) console.log(`\nDODO_PACKS=${JSON.stringify(out)}`);
