import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { creditBoost } from "@/lib/boosts";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Fast-path crediting after Checkout succeeds. The signature is verified
// server-side with the key secret, so this is as trustworthy as the webhook —
// which still runs and lands on the same idempotent upsert.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (
    !verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const { data: order } = await createAdminClient()
    .from("orders")
    .select("product_id, user_id, amount")
    .eq("razorpay_order_id", razorpay_order_id)
    .single();
  if (!order) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  const { error } = await creditBoost({
    productId: order.product_id,
    userId: order.user_id,
    amount: order.amount,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
