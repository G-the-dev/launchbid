// Seed the board with real products so the podium, table, and pagination render.
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: list } = await admin.auth.admin.listUsers();
const owner = list.users.find((u) => u.email === "spamgaurav139@gmail.com");
if (!owner) throw new Error("seed owner missing");

const fav = (d) => `https://www.google.com/s2/favicons?domain=${d}&sz=128`;
const SITES = [
  ["https://raycast.com", "raycast", "Raycast", "A blazingly fast launcher for your Mac", 95, 142],
  ["https://linear.app", "linear", "Linear", "Issue tracking your team will actually love", 80, 118],
  ["https://cal.com", "cal-com", "Cal.com", "Scheduling infrastructure for everyone", 66, 87],
  ["https://resend.com", "resend", "Resend", "Email for developers that actually lands", 54, 64],
  ["https://posthog.com", "posthog", "PostHog", "Product analytics you can self-host", 41, 71],
  ["https://excalidraw.com", "excalidraw", "Excalidraw", "Virtual whiteboard with a hand-drawn feel", 33, 53],
  ["https://www.tldraw.com", "tldraw", "tldraw", "A very good whiteboard on the canvas", 27, 38],
  ["https://warp.dev", "warp", "Warp", "The terminal reimagined with AI", 19, 26],
  ["https://obsidian.md", "obsidian", "Obsidian", "Your second brain, in local markdown", 12, 17],
  ["https://excalidraw-alternative.invalid", null, null, null, 0, 0], // placeholder skipped below
];

// give pagehaul the crown first
const { data: ph } = await admin.from("products").select("id,total_amount").eq("slug", "pagehaul").single();
if (ph && Number(ph.total_amount) < 120) {
  await admin.from("boosts").insert({ product_id: ph.id, user_id: owner.id, amount: 120 - Number(ph.total_amount), source: "tokens" });
}

let placed = 0;
for (const [url, slug, name, tagline, total, clicks] of SITES) {
  if (!slug) continue;
  const host = new URL(url).hostname.replace(/^www\./, "");
  const { data: inserted, error } = await admin
    .from("products")
    .upsert(
      { owner_id: owner.id, url, slug, name, tagline, favicon_url: fav(host) },
      { onConflict: "url", ignoreDuplicates: true }
    )
    .select("id");
  const { data: row } = await admin.from("products").select("id,total_amount").eq("slug", slug).single();
  if (!row) { console.log("skip", slug, error?.message); continue; }
  if (Number(row.total_amount) < total) {
    // split into 2 boosts for a fuller ledger
    const first = Math.ceil((total - Number(row.total_amount)) * 0.6);
    const rest = total - Number(row.total_amount) - first;
    await admin.from("boosts").insert({ product_id: row.id, user_id: owner.id, amount: first, source: "tokens" });
    if (rest > 0) await admin.from("boosts").insert({ product_id: row.id, user_id: owner.id, amount: rest, source: "tokens" });
  }
  const hoursAgo = 1 + Math.floor(Math.random() * 40);
  await admin.from("products").update({
    click_count: clicks,
    last_boost_at: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
  }).eq("id", row.id);
  placed++;
}
const { data: board } = await admin.from("products").select("slug,total_amount").order("total_amount", { ascending: false });
console.log(`seeded ${placed} products; board:`, board.map((b) => `${b.slug}:${b.total_amount}`).join(" "));
