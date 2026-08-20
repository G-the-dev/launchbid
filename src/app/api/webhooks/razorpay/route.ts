import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { creditBoost } from "@/lib/boosts";

// Authoritative crediting path. Razorpay retries on non-2xx, so return 200
// for anything we handled — including duplicates.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const productId = payment?.notes?.product_id;
    const userId = payment?.notes?.user_id ?? null;

    if (payment?.id && payment?.order_id && productId) {
      const { error } = await creditBoost({
        productId,
        userId,
        amount: payment.amount,
        paymentId: payment.id,
        orderId: payment.order_id,
      });
      if (error) {
        // 500 so Razorpay retries a transient DB failure
        return NextResponse.json({ error }, { status: 500 });
      }
    }
  } else if (event.event === "payment.failed") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await createAdminClient()
        .from("orders")
        .update({ status: "failed" })
        .eq("razorpay_order_id", orderId)
        .eq("status", "created");
    }
  }

  return NextResponse.json({ ok: true });
}
