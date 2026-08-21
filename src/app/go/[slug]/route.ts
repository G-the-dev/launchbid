import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Outbound click tracker + visit reward. Signed-in visitors earn tokens
// (rules enforced in the register_visit function); everyone gets redirected.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: product } = await createAdminClient()
    .from("products")
    .select("id, url")
    .eq("slug", slug)
    .single();
  if (!product) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();
  await supabase.rpc("register_visit", { p_product: product.id });

  return NextResponse.redirect(product.url);
}
