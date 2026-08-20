import { createAdminClient } from "./supabase/admin";

// Idempotent credit: the unique constraint on razorpay_payment_id means the
// webhook and the checkout verify fast-path can race harmlessly.
export async function creditBoost(params: {
  productId: string;
  userId: string | null;
  amount: number;
  paymentId: string;
  orderId: string;
}): Promise<{ error?: string }> {
  const admin = createAdminClient();

  const { error } = await admin.from("boosts").upsert(
    {
      product_id: params.productId,
      user_id: params.userId,
      amount: params.amount,
      razorpay_payment_id: params.paymentId,
      razorpay_order_id: params.orderId,
    },
    { onConflict: "razorpay_payment_id", ignoreDuplicates: true }
  );
  if (error) return { error: error.message };

  await admin
    .from("orders")
    .update({ status: "paid" })
    .eq("razorpay_order_id", params.orderId);

  return {};
}
