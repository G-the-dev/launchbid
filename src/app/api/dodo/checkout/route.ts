import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dodoBase, getDodoPacks } from "@/lib/dodo";

// Creates a Dodo checkout session for a token pack and returns its URL.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Your session is still starting. Try again in a second." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as { usd?: number } | null;
  const pack = getDodoPacks().find((p) => p.usd === body?.usd);
  if (!pack) {
    return NextResponse.json({ error: "Pick a pack." }, { status: 400 });
  }

  const res = await fetch(`${dodoBase()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [{ product_id: pack.productId, quantity: 1 }],
      return_url: `${process.env.SITE_URL}/tokens?paid=1`,
      // Server-set metadata: the webhook trusts this, never the client.
      metadata: { user_id: user.id, tokens: String(pack.tokens) },
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  const data = res ? await res.json().catch(() => ({})) : {};
  if (!res?.ok || !data.checkout_url) {
    const reason =
      data?.code === "MERCHANT_NOT_LIVE"
        ? "Card payments are almost ready. Check back soon."
        : "Could not reach the payment provider. Try again.";
    return NextResponse.json({ error: reason }, { status: 502 });
  }

  return NextResponse.json({ url: data.checkout_url });
}
