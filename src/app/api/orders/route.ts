import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay";
import { MAX_BOOST_PAISE, MIN_BOOST_PAISE } from "@/lib/money";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  productId: z.string().regex(UUID_RE),
  amount: z.number().int().min(MIN_BOOST_PAISE).max(MAX_BOOST_PAISE),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to boost." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Boost must be between ₹10 and ₹5,00,000." },
      { status: 400 }
    );
  }
  const { productId, amount } = parsed.data;

  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .single();
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  let order;
  try {
    order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      // Server-set notes: the webhook trusts these, never the client.
      notes: { product_id: productId, user_id: user.id },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment gateway. Try again." },
      { status: 502 }
    );
  }

  const { error: insertError } = await createAdminClient().from("orders").insert({
    razorpay_order_id: order.id,
    product_id: productId,
    user_id: user.id,
    amount,
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    amount,
    keyId: process.env.RAZORPAY_KEY_ID,
    productName: product.name,
  });
}
