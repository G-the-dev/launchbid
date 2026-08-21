import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getIntlPacks, getPolar } from "@/lib/polar";

// Creates a Polar checkout for an international token pack and returns its URL.
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
  const pack = getIntlPacks().find((p) => p.usd === body?.usd);
  if (!pack) {
    return NextResponse.json({ error: "Pick a pack." }, { status: 400 });
  }

  try {
    const checkout = await getPolar().checkouts.create({
      products: [pack.productId],
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/tokens?paid=1`,
      // Server-set metadata: the webhook trusts this, never the client.
      metadata: { user_id: user.id, tokens: String(pack.tokens) },
    });
    return NextResponse.json({ url: checkout.url });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment provider. Try again." },
      { status: 502 }
    );
  }
}
