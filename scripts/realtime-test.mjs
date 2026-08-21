// Does the board actually update live? Subscribe like the browser does,
// then touch a product with the admin client and wait for the event.
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let got = null;
const done = new Promise((resolve) => { got = resolve; });
const channel = anon
  .channel("test-board")
  .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => got(payload))
  .subscribe(async (status) => {
    console.log("subscription:", status);
    if (status === "SUBSCRIBED") {
      await admin.from("products").update({ last_boost_at: new Date().toISOString() }).eq("slug", "obsidian");
    }
  });

const result = await Promise.race([done, new Promise((r) => setTimeout(() => r(null), 10000))]);
console.log(result ? `PASS  realtime event received (${result.eventType} on ${result.new?.slug ?? "row"})` : "FAIL  no realtime event within 10s (polling fallback still covers the board every 25s)");
await anon.removeChannel(channel);
process.exit(0);
