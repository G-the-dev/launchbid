import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/data";
import type { BoostWithProfile, Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import PixelFace from "@/components/PixelFace";
import BoostPanel from "@/components/BoostPanel";
import RecentBoosts from "@/components/RecentBoosts";
import SpawnCelebration from "@/components/SpawnCelebration";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, tagline, total_amount")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Not found" };
  const description =
    data.tagline ??
    `${data.name} is competing on the LaunchBid leaderboard with ${data.total_amount} tokens bid.`;
  return {
    title: data.name,
    description,
    alternates: { canonical: `/p/${slug}` },
    openGraph: { title: `${data.name} · LaunchBid`, description, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title: `${data.name} · LaunchBid`, description },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spawned?: string }>;
}) {
  const { slug } = await params;
  const { spawned } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!data) notFound();
  const product = data as Product;

  const [{ count }, { data: boostsData }, balance, { data: othersData }] = await Promise.all([
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
    getBalance(),
    supabase
      .from("products")
      .select("slug, name, total_amount")
      .neq("id", product.id)
      .order("total_amount", { ascending: false })
      .limit(5),
  ]);
  const others = (othersData ?? []) as Pick<Product, "slug" | "name" | "total_amount">[];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "LaunchBid", item: "https://launchbid.lol" },
      { "@type": "ListItem", position: 2, name: product.name, item: `https://launchbid.lol/p/${product.slug}` },
    ],
  };

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
      {spawned === "1" && <SpawnCelebration />}
      <section className="flex items-start gap-4">
        <PixelFace seed={product.slug} size={56} />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-balance">
            <a
              href={`/go/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:underline"
              title={`Open ${host}: you earn 2 tokens`}
            >
              {product.name}
            </a>
          </h1>
          {product.tagline && (
            <p className="mt-1 text-base text-pretty text-mcgray">
              {product.tagline}
            </p>
          )}
          <a
            href={`/go/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-1 inline-block text-sm font-medium text-mcgray hover:text-white hover:underline"
            title="Visit: you earn 2 tokens"
          >
            {host} ↗
          </a>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-none border border-black/70 bg-[#2a2a30] text-center sm:grid-cols-4">
        {stats.map(({ k, v }) => (
          <div key={k} className="bg-[#101013] px-2 py-3.5">
            <dd className="text-base font-semibold tabular-nums">{v}</dd>
            <dt className="mt-0.5 text-sm text-mcgray">{k}</dt>
          </div>
        ))}
      </dl>

      <BoostPanel productId={product.id} balance={balance} />

      <RecentBoosts boosts={boosts} />

      <p className="text-sm text-pretty text-mcgray">
        {product.name} is competing on LaunchBid, the live product leaderboard
        where rank is decided by tokens bid. It currently holds rank #{rank}
        with {product.total_amount} tokens across {product.boost_count} boost
        {product.boost_count === 1 ? "" : "s"} and {product.click_count} click
        {product.click_count === 1 ? "" : "s"}. Bid tokens on it to push it up
        the board, or visit {host} directly. Totals never reset.
      </p>

      {others.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">More from the board</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/p/${other.slug}`}
                  className="mc-btn px-3 py-1.5 text-xs"
                >
                  {other.name} · {String(other.total_amount)} ⚡
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
