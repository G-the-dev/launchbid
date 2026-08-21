// LAUNCH-DAY CLEANUP: removes the seeded third-party listings (keeps pagehaul).
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const SEED_SLUGS = ["raycast","linear","cal-com","resend","posthog","excalidraw","tldraw","warp","obsidian"];
const { error, count } = await admin.from("products").delete({ count: "exact" }).in("slug", SEED_SLUGS);
console.log(error ? "FAIL " + error.message : `deleted ${count} seeded listings (boost history cascades)`);
