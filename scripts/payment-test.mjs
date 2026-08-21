// Full purchase pipeline against PROD: pending row -> signed approve link ->
// credit -> idempotent re-approve -> buyer email. Reverts the credit after.
import { readFileSync } from "fs";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ok = (n, c) => console.log(`${c ? "PASS" : "FAIL"}  ${n}`);

const { data: list } = await admin.auth.admin.listUsers();
const buyer = list.users.find((u) => u.email === "spamgaurav139@gmail.com");
const balBefore = Number((await admin.from("profiles").select("token_balance").eq("id", buyer.id).single()).data.token_balance);

const { data: purchase } = await admin.from("purchases").insert({
  user_id: buyer.id, email: "spamgaurav139@gmail.com", amount_inr: 49, tokens: 50, utr: "TESTUTR12345",
}).select("id").single();
ok("purchase row stored", !!purchase.id);

const sig = crypto.createHmac("sha256", env.PURCHASE_APPROVE_SECRET).update(purchase.id).digest("hex");
const approveUrl = `https://launchbid.vercel.app/api/purchases/approve?id=${purchase.id}&sig=${sig}`;

const bad = await fetch(`https://launchbid.vercel.app/api/purchases/approve?id=${purchase.id}&sig=${"0".repeat(64)}`);
ok("wrong signature rejected", (await bad.text()).includes("Invalid link"));

const r1 = await fetch(approveUrl); const t1 = await r1.text();
ok("approve link credits tokens", t1.includes("Approved") && t1.includes("50 tokens credited"));

const balAfter = Number((await admin.from("profiles").select("token_balance").eq("id", buyer.id).single()).data.token_balance);
ok(`balance +50 (${balBefore} -> ${balAfter})`, balAfter === balBefore + 50);

const row = (await admin.from("purchases").select("status,approved_at").eq("id", purchase.id).single()).data;
ok("purchase marked approved with timestamp", row.status === "approved" && !!row.approved_at);

const r2 = await fetch(approveUrl); const t2 = await r2.text();
ok("second click is idempotent", t2.includes("Already approved"));
const balAgain = Number((await admin.from("profiles").select("token_balance").eq("id", buyer.id).single()).data.token_balance);
ok("no double credit", balAgain === balAfter);

const { data: ev } = await admin.from("token_events").select("id").eq("purchase_id", purchase.id);
ok("ledger entry recorded", ev.length === 1);

// revert test credit and remove test rows
await admin.rpc("credit_tokens", { p_user: buyer.id, p_delta: -50, p_kind: "purchase", p_meta: "test-revert" });
await admin.from("purchases").delete().eq("id", purchase.id);
console.log("test credit reverted, test purchase removed");
console.log("NOTE: a real confirmation email for this test was sent to spamgaurav139@gmail.com; check the inbox to confirm delivery.");
