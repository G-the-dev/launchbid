import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail";
import { formatTokens } from "@/lib/tokens";

function page(title: string, body: string, ok: boolean) {
  return new Response(
    `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1">
<body style="font-family:system-ui;display:grid;place-items:center;min-height:90vh;background:#faf9f6;color:#1c1917">
<div style="text-align:center;max-width:26rem;padding:1rem">
<div style="font-size:3rem">${ok ? "✅" : "⚠️"}</div>
<h1 style="font-size:1.3rem">${title}</h1><p style="color:#666">${body}</p>
</div></body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

// Owner-only approval link, delivered by email (HMAC-signed). Idempotent.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const sig = searchParams.get("sig") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.PURCHASE_APPROVE_SECRET!)
    .update(id)
    .digest("hex");
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return page("Invalid link", "This approval link is not valid.", false);
  }

  const admin = createAdminClient();
  const { data: purchase } = await admin
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();
  if (!purchase) return page("Not found", "No such purchase.", false);
  if (purchase.status === "approved") {
    return page("Already approved", "Tokens were already credited for this purchase.", true);
  }

  const { error: creditError } = await admin.rpc("credit_tokens", {
    p_user: purchase.user_id,
    p_delta: purchase.tokens,
    p_kind: "purchase",
    p_purchase: purchase.id,
  });
  if (creditError) {
    return page("Credit failed", creditError.message, false);
  }

  await admin
    .from("purchases")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);

  await sendMail({
    to: purchase.email,
    subject: `Your ${formatTokens(purchase.tokens)} just landed on LaunchBid`,
    html: `<p>Payment confirmed — <b>${purchase.tokens} tokens</b> are in your LaunchBid balance.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Spend them on the leaderboard</a> and take your spot.</p>
<p style="color:#888;font-size:0.85em">You'll also get product updates from LaunchBid at this address.</p>`,
  });

  return page(
    "Approved",
    `${purchase.tokens} tokens credited to ${purchase.email}. The buyer has been emailed.`,
    true
  );
}
