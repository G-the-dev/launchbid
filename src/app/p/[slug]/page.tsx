import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BoostWithProfile, Product } from "@/lib/types";
import { formatPaise } from "@/lib/money";
import Favicon from "@/components/Favicon";
import BoostPanel from "@/components/BoostPanel";
import RecentBoosts from "@/components/RecentBoosts";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!data) notFound();
  const product = data as Product;

  const [{ count }, { data: boostsData }, { data: auth }] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gt("total_amount", product.total_amount),
    supabase
      .from("boosts")
      .select("id, amount, created_at, profiles(display_name)")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.auth.getUser(),
  ]);

  const rank = (count ?? 0) + 1;
  const boosts = (boostsData ?? []) as unknown as BoostWithProfile[];
  let host = "";
  try {
    host = new URL(product.url).hostname.replace(/^www\./, "");
  } catch {
    host = product.url;
  }

  return (
    <div className="pt-12 space-y-8">
      <section className="flex items-start gap-4">
        <Favicon src={product.favicon_url} name={product.name} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{product.name}</h1>
          {product.tagline && <p className="opacity-70 mt-1">{product.tagline}</p>}
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
          >
            {host} ↗
          </a>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tabular-nums">
            {formatPaise(product.total_amount)}
          </div>
          <div className="text-sm opacity-70">
            rank #{rank} · {product.boost_count} boost
            {product.boost_count === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <BoostPanel
        productId={product.id}
        productName={product.name}
        isSignedIn={!!auth.user}
        loginHref={`/login?next=/p/${product.slug}`}
      />

      <RecentBoosts boosts={boosts} />
    </div>
  );
}
