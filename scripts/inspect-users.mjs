import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: products } = await admin.from("products").select("slug,name,owner_id,created_at,total_amount,click_count").order("created_at", { ascending: false });
const seedOwnerEmails = ["spamgaurav139@gmail.com"];
const { data: users } = await admin.auth.admin.listUsers();
const seedIds = users.users.filter(u => seedOwnerEmails.includes(u.email ?? "")).map(u => u.id);

for (const p of products) {
  if (seedIds.includes(p.owner_id)) continue; // skip your seeded listings
  console.log(`\n=== ${p.name} (${p.slug}) listed ${p.created_at} | ${p.total_amount} tokens on board | ${p.click_count} clicks`);
  const { data: events } = await admin.from("token_events").select("delta,kind,meta,created_at").eq("user_id", p.owner_id).order("created_at", { ascending: true });
  for (const e of events ?? []) {
    console.log(`  ${e.created_at}  ${e.delta > 0 ? "+" : ""}${e.delta} ${e.kind}${e.meta ? "  " + e.meta : ""}`);
  }
  const { data: prof } = await admin.from("profiles").select("token_balance,created_at").eq("id", p.owner_id).single();
  console.log(`  balance now: ${prof?.token_balance} | identity created: ${prof?.created_at}`);
  const { data: purch } = await admin.from("purchases").select("amount_inr,status").eq("user_id", p.owner_id);
  if (purch?.length) console.log(`  purchases: ${JSON.stringify(purch)}`);
}
