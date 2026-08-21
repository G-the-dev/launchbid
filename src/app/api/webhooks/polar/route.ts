import { NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail";
import { tokensCreditedEmail } from "@/lib/email";

// Polar is the source of truth for international payments. Idempotent on the
// order id: retries and duplicate events can never double-credit.
export async function POST(request: Request) {
  const rawBody = await request.text();

  let event;
  try {
    event = validateEvent(
      rawBody,
      Object.fromEntries(request.headers.entries()),
      process.env.POLAR_WEBHOOK_SECRET!
    );
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
    }
    throw error;
  }

  if (event.type === "order.paid") {
    const order = event.data;
    const userId = order.metadata?.user_id as string | undefined;
    const tokens = Number(order.metadata?.tokens ?? 0);
    const email = order.customer?.email ?? null;

    if (userId && tokens > 0) {
      const admin = createAdminClient();
      const { data: inserted, error } = await admin
        .from("purchases")
        .upsert(
          {
            user_id: userId,
            email: email ?? "unknown@polar",
            tokens,
            status: "approved",
            approved_at: new Date().toISOString(),
            source: "polar",
            external_id: order.id,
            amount_cents: order.totalAmount ?? null,
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
              siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
            }),
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
