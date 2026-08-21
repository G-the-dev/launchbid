// End-to-end economy test against the live DB: two anonymous users,
// paid listing, bidding, and balance isolation. Cleans up after itself.
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL_, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ok = (name, cond) => console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);

const a = createClient(URL_, ANON, { auth: { persistSession: false } });
const b = createClient(URL_, ANON, { auth: { persistSession: false } });
const { data: ua } = await a.auth.signInAnonymously();
const { data: ub } = await b.auth.signInAnonymously();
ok("two separate anonymous identities", ua.user.id !== ub.user.id);

// A: spawn without tokens must fail
let r = await a.rpc("spawn_product", { p_url: "https://lb-test-a.example.com", p_slug: "lb-test-a", p_name: "TestA", p_tagline: "", p_favicon: "" });
ok("spawn blocked at 0 tokens", r.error?.message.includes("NOT_ENOUGH_TOKENS"));

// credit A 50 (simulating a verified share), then spawn
await admin.rpc("credit_tokens", { p_user: ua.user.id, p_delta: 50, p_kind: "share_x", p_meta: "test" });
r = await a.rpc("spawn_product", { p_url: "https://lb-test-a.example.com", p_slug: "lb-test-a", p_name: "TestA", p_tagline: "", p_favicon: "" });
ok("spawn succeeds with 50 tokens", !r.error);
let { data: pa } = await a.from("profiles").select("token_balance").eq("id", ua.user.id).single();
ok("balance 50-25=25 after spawn", Number(pa.token_balance) === 25);

// A bids 5 on own product
const { data: prod } = await admin.from("products").select("id,total_amount").eq("slug", "lb-test-a").single();
r = await a.rpc("boost_with_tokens", { p_product: prod.id, p_tokens: 5 });
ok("bid of 5 accepted, balance now 20", Number(r.data) === 20);
r = await a.rpc("boost_with_tokens", { p_product: prod.id, p_tokens: 4 });
ok("bid below 5 rejected", !!r.error);
r = await a.rpc("boost_with_tokens", { p_product: prod.id, p_tokens: 9999 });
ok("overdraw rejected", r.error?.message.includes("Not enough"));
const { data: after } = await admin.from("products").select("total_amount,boost_count,last_boost_at").eq("id", prod.id).single();
ok("product total=5, count=1, last_boost set", Number(after.total_amount) === 5 && after.boost_count === 1 && !!after.last_boost_at);

// B is untouched
const { data: pb } = await b.from("profiles").select("token_balance").eq("id", ub.user.id).single();
ok("user B still has 0 tokens (isolated)", Number(pb.token_balance) === 0);
// B cannot write A's profile
r = await b.from("profiles").update({ token_balance: 999 }).eq("id", ua.user.id).select();
ok("B cannot modify A's balance", (r.data ?? []).length === 0);
// share reward is once per user
r = await admin.rpc("credit_tokens", { p_user: ua.user.id, p_delta: 50, p_kind: "share_x", p_meta: "again" });
ok("second share claim blocked by unique index", !!r.error);

// cleanup
await admin.from("products").delete().eq("id", prod.id);
await admin.auth.admin.deleteUser(ua.user.id);
await admin.auth.admin.deleteUser(ub.user.id);
console.log("cleanup done");
