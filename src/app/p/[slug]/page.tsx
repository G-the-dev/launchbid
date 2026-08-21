import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BoostWithProfile, Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
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
    supabase.auth.getSession(),
  ]);

  let balance = 0;
  const authUser = auth.session?.user ?? null;
  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", authUser.id)
      .single();
    balance = Number(profile?.token_balance ?? 0);
  }

  const rank = (count ?? 0) + 1;
  const boosts = (boostsData ?? []) as unknown as BoostWithProfile[];
  let host = "";
  try {
    host = new URL(product.url).hostname.replace(/^www\./, "");
  } catch {
    host = product.url;
  }

  const stats = [
    { k: "Rank", v: `#${rank}` },
    { k: "Tokens bid", v: formatTokens(product.total_amount) },
    { k: "Boosts", v: String(product.boost_count) },
    { k: "Clicks", v: String(product.click_count) },
  ];

  return (
    <div className="space-y-8 pt-12">
      <section className="flex items-start gap-4">
        <Favicon src={product.favicon_url} name={product.name} size={56} />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-balance">
            <a
              href={`/go/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:underline"
              title={`Open ${host} — you earn 2 tokens`}
            >
              {product.name}
            </a>
          </h1>
          {product.tagline && (
            <p className="mt-1 text-base text-pretty text-zinc-400">
              {product.tagline}
            </p>
          )}
          <a
            href={`/go/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-1 inline-block text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:underline"
            title="Visit — you earn 2 tokens"
          >
            {host} ↗
          </a>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 text-center sm:grid-cols-4">
        {stats.map(({ k, v }) => (
          <div key={k} className="bg-zinc-900 px-2 py-3.5">
            <dd className="text-base font-semibold tabular-nums">{v}</dd>
            <dt className="mt-0.5 text-sm text-zinc-400">{k}</dt>
          </div>
        ))}
      </dl>

      <BoostPanel productId={product.id} balance={balance} />

      <RecentBoosts boosts={boosts} />
    </div>
  );
}
