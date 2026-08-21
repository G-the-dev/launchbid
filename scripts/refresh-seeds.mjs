// Replace hand-written seed copy with each site's real og title/description.
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const meta = (html, attr, key) =>
  html.match(new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i"))?.[1];

const { data: products } = await admin.from("products").select("id, slug, url");
for (const p of products) {
  try {
    const res = await fetch(p.url, { signal: AbortSignal.timeout(8000), headers: { "user-agent": "LaunchBidBot/1.0" } });
    if (!res.ok) { console.log(p.slug, "skip", res.status); continue; }
    const html = (await res.text()).slice(0, 250_000);
    const title = meta(html, "property", "og:site_name") ?? meta(html, "property", "og:title") ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
    const desc = meta(html, "property", "og:description") ?? meta(html, "name", "description");
    const update = {};
    if (title) update.name = title.trim().slice(0, 80);
    if (desc) update.tagline = desc.trim().slice(0, 140);
    if (Object.keys(update).length) {
      await admin.from("products").update(update).eq("id", p.id);
      console.log(p.slug, "->", update.name);
    }
  } catch (e) { console.log(p.slug, "err", e.message); }
}
