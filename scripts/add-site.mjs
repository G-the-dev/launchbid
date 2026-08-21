// Add one site to the board at a target token total.
// Usage: node scripts/add-site.mjs <url> <slug> <targetTokens>
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const [url, slug, targetStr] = process.argv.slice(2);
const target = Number(targetStr);
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: list } = await admin.auth.admin.listUsers();
const owner = list.users.find((u) => u.email === "spamgaurav139@gmail.com");
const host = new URL(url).hostname;

let name = host.replace(/\.framer\.website$|\.vercel\.app$/, "");
let tagline = null;
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(9000), headers: { "user-agent": "LaunchBidBot/1.0" } });
  const html = (await res.text()).slice(0, 250_000);
  const meta = (attr, key) => html.match(new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1] ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i"))?.[1];
  name = (meta("property", "og:site_name") ?? meta("property", "og:title") ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? name).trim().slice(0, 80);
  tagline = (meta("property", "og:description") ?? meta("name", "description"))?.trim().slice(0, 140) ?? null;
} catch { console.log("metadata fetch failed, using fallbacks"); }

await admin.from("products").upsert(
  { owner_id: owner.id, url, slug, name, tagline, favicon_url: `https://www.google.com/s2/favicons?domain=${host}&sz=128` },
  { onConflict: "url", ignoreDuplicates: true }
);
const { data: row } = await admin.from("products").select("id,total_amount").eq("slug", slug).single();
if (Number(row.total_amount) < target) {
  await admin.from("boosts").insert({ product_id: row.id, user_id: owner.id, amount: target - Number(row.total_amount), source: "tokens" });
}
await admin.from("products").update({ click_count: 21 }).eq("id", row.id);
const { data: board } = await admin.from("products").select("slug,total_amount").order("total_amount", { ascending: false }).limit(4);
console.log("board top:", board.map((b) => `${b.slug}:${b.total_amount}`).join("  "));
