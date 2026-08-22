import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail";
import { tokensCreditedEmail } from "@/lib/email";

// Standard Webhooks verification: HMAC-SHA256(base64) over "id.timestamp.payload"
// with the whsec_ secret. Idempotent on the payment id.
function verify(rawBody: string, headers: Headers): boolean {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signature = headers.get("webhook-signature");
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!id || !timestamp || !signature || !secret) return false;
  // Reject events older than 5 minutes to block replays
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  return signature.split(" ").some((part) => {
    const value = part.includes(",") ? part.split(",")[1] : part;
    const a = Buffer.from(value ?? "");
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verify(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  if (event.type === "payment.succeeded") {
    const payment = event.data ?? {};
    const userId = payment.metadata?.user_id as string | undefined;
    const tokens = Number(payment.metadata?.tokens ?? 0);
    const email = payment.customer?.email ?? null;
    const paymentId = payment.payment_id ?? payment.id;

    if (userId && tokens > 0 && paymentId) {
      const admin = createAdminClient();
      const { data: inserted, error } = await admin
        .from("purchases")
        .upsert(
          {
            user_id: userId,
            email: email ?? "unknown@dodo",
            tokens,
            status: "approved",
            approved_at: new Date().toISOString(),
            source: "dodo",
            external_id: paymentId,
            amount_cents: payment.total_amount ?? null,
          },
          { onConflict: "external_id", ignoreDuplicates: true }
        )
        .select("id");
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (inserted && inserted.length > 0) {
        const { error: creditError } = await admin.rpc("credit_tokens", {
          p_user: userId,
          p_delta: tokens,
          p_kind: "purchase",
          p_purchase: inserted[0].id,
        });
        if (creditError) {
          return NextResponse.json({ error: creditError.message }, { status: 500 });
        }
        if (email) {
          await sendMail({
            to: email,
            subject: `Your ${tokens} ⚡ just landed on LaunchBid`,
            html: tokensCreditedEmail({
              tokens,
              siteUrl: process.env.SITE_URL!,
            }),
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
