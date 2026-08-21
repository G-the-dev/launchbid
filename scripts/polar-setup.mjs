// One-time Polar setup: creates the USD token-pack products and the webhook
// endpoint, then prints the env lines to add. Needs POLAR_ACCESS_TOKEN in
// .env.local (Organization Access Token from polar.sh dashboard settings).
import { readFileSync } from "fs";
import crypto from "crypto";

const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const TOKEN = env.POLAR_ACCESS_TOKEN;
if (!TOKEN) { console.error("Add POLAR_ACCESS_TOKEN to .env.local first."); process.exit(1); }

const api = async (path, body) => {
  const res = await fetch(`https://api.polar.sh/v1${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
};

const PACKS = [
  { usd: 1, tokens: 90 },
  { usd: 3, tokens: 290 },
  { usd: 5, tokens: 500 },
  { usd: 10, tokens: 1050 },
];

const out = [];
for (const pack of PACKS) {
  const product = await api("/products", {
    name: `LaunchBid ${pack.tokens} tokens`,
    description: `${pack.tokens} bidding tokens for the LaunchBid leaderboard.`,
    recurring_interval: null,
    prices: [{ amount_type: "fixed", price_amount: pack.usd * 100, price_currency: "usd" }],
  });
  out.push({ usd: pack.usd, tokens: pack.tokens, productId: product.id });
  console.log(`product created: $${pack.usd} -> ${pack.tokens} tokens (${product.id})`);
}

const secret = crypto.randomBytes(24).toString("hex");
const hook = await api("/webhooks/endpoints", {
  url: "https://launchbid.vercel.app/api/webhooks/polar",
  format: "raw",
  secret,
  events: ["order.paid"],
});
console.log(`webhook endpoint created: ${hook.id}`);
console.log("\nAdd these to env (local + Vercel):");
console.log(`POLAR_PACKS=${JSON.stringify(out)}`);
console.log(`POLAR_WEBHOOK_SECRET=${secret}`);
