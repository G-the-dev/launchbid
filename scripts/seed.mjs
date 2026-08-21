// Seed: create the owner account and list pagehaul.vercel.app.
// Usage: node scripts/seed.mjs  (reads .env.local)
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const OWNER_EMAIL = "spamgaurav139@gmail.com";
const SEED = {
  url: "https://pagehaul.vercel.app",
  slug: "pagehaul",
  name: "PageHaul",
  tagline: "Grab every asset from any web page in one haul",
  favicon_url: "https://www.google.com/s2/favicons?domain=pagehaul.vercel.app&sz=64",
};

// find-or-create the owner user
let userId;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: OWNER_EMAIL,
  email_confirm: true,
});
if (created?.user) {
  userId = created.user.id;
  console.log("created user", OWNER_EMAIL);
} else {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === OWNER_EMAIL);
  if (!existing) throw new Error(`user create failed: ${createErr?.message}`);
  userId = existing.id;
  console.log("user already existed");
}

// try to pull real metadata from the live site
try {
  const res = await fetch(SEED.url, { signal: AbortSignal.timeout(6000) });
  const html = (await res.text()).slice(0, 200_000);
  const meta = (attr, key) =>
    html.match(new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i"))?.[1];
  const title = meta("property", "og:site_name") ?? meta("property", "og:title") ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  const desc = meta("property", "og:description") ?? meta("name", "description");
  if (title) SEED.name = title.trim().slice(0, 80);
  if (desc) SEED.tagline = desc.trim().slice(0, 140);
} catch {
  console.log("live metadata fetch failed, using defaults");
}

const { error: productErr } = await admin.from("products").upsert(
  { owner_id: userId, ...SEED },
  { onConflict: "url", ignoreDuplicates: true }
);
if (productErr) throw new Error(productErr.message);

// welcome bonus for the first listing (one-time via partial unique index)
const { error: welcomeErr } = await admin.rpc("credit_tokens", {
  p_user: userId,
  p_delta: 25,
  p_kind: "welcome",
});
console.log("welcome bonus:", welcomeErr ? "already granted" : "+25 tokens");

const { data: board } = await admin
  .from("products")
  .select("slug, name, total_amount")
  .order("total_amount", { ascending: false });
console.log("board:", JSON.stringify(board));
