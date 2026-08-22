import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
await admin.from("products").update({ favicon_url: "https://launchbid.lol/logos/pagehaul.svg" }).eq("slug", "pagehaul");
await admin.from("products").update({ favicon_url: "https://framerusercontent.com/images/BpFxWsB3fryIXJO42Na9TzJcYJI.png" }).eq("slug", "dzindeck");
console.log("logos updated");
