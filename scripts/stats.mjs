import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const [{ count: products }, { count: players }, { count: boosts }, { data: prods }, { count: shares }, { count: visits }] = await Promise.all([
  admin.from("products").select("*", { count: "exact", head: true }),
  admin.from("profiles").select("*", { count: "exact", head: true }),
  admin.from("boosts").select("*", { count: "exact", head: true }),
  admin.from("products").select("total_amount,click_count,name").order("total_amount", { ascending: false }),
  admin.from("token_events").select("*", { count: "exact", head: true }).eq("kind", "share_x"),
  admin.from("token_events").select("*", { count: "exact", head: true }).eq("kind", "visit"),
]);
const tokens = prods.reduce((s, p) => s + Number(p.total_amount), 0);
const clicks = prods.reduce((s, p) => s + Number(p.click_count), 0);
console.log(JSON.stringify({ products, players, boosts, tokens, clicks, shares, visits, top: prods[0]?.name, topTokens: prods[0]?.total_amount }, null, 1));
