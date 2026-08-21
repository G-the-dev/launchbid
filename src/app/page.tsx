import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import Pagination from "@/components/Pagination";
import { SHARE_X_TOKENS, VISIT_TOKENS, formatTokens } from "@/lib/tokens";
import { btnPrimary, card } from "@/lib/ui";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Math.floor(Number(rawPage) || 1));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const [{ data, count: productCount }, { count: boostCount }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("total_amount", { ascending: false })
        .order("created_at", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1),
      supabase.from("boosts").select("*", { count: "exact", head: true }),
    ]);

  const products = (data ?? []) as Product[];
  const totalBid = products.reduce((sum, p) => sum + Number(p.total_amount), 0);

  const ways = [
    {
      title: "Share quest",
      desc: `Post LaunchBid on X and claim +${SHARE_X_TOKENS} ⚡`,
      href: "/earn",
    },
    {
      title: "Explore quest",
      desc: `+${VISIT_TOKENS} ⚡ for every product you visit`,
      href: "/earn",
    },
    {
      title: "Villager trade",
      desc: "UPI token packs from ₹49. Scan, pay, done.",
      href: "/tokens",
    },
  ];

  return (
    <div className="pt-12">
      <section className="py-10 text-center">
        <h1 className="pixel-text text-3xl text-balance uppercase sm:text-4xl">
          Mine your way to <span className="text-gold">#1</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-pretty text-mcgray">
          A live leaderboard where tokens are bids. Craft tokens for free or
          grab UPI packs, then outbid the whole server for the top spot.
        </p>

        <form
          action="/submit"
          method="get"
          className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="hero-url" className="sr-only">
            Your product&apos;s website
          </label>
          <input
            id="hero-url"
            name="url"
            type="text"
            required
            placeholder="yourproduct.com"
            className="mc-input min-w-0 flex-1 px-3.5 py-2.5 text-base"
          />
          <button type="submit" className={`${btnPrimary} w-full shrink-0 sm:w-auto`}>
            Spawn my product
          </button>
        </form>
        <p className="pixel-text mt-3 text-sm text-gold">
          Spawning costs 25 ⚡ and one X share earns 50, instantly. No sign-up.
        </p>
      </section>

      <div className="mc-panel mx-auto grid max-w-xl grid-cols-3 divide-x-2 divide-black/70 text-center">
        {[
          { k: "Tokens bid", v: formatTokens(totalBid) },
          { k: "On the server", v: String(productCount ?? products.length) },
          { k: "Boosts placed", v: String(boostCount ?? 0) },
        ].map(({ k, v }) => (
          <div key={k} className="px-2 py-3.5">
            <div className="pixel-text text-base tabular-nums">{v}</div>
            <div className="mt-0.5 text-sm text-mcgray">{k}</div>
          </div>
        ))}
      </div>

      <section className="relative left-1/2 mt-14 w-screen max-w-5xl -translate-x-1/2 px-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="pixel-text text-xl uppercase">Server leaderboard</h2>
          <p className="text-sm text-mcgray">Totals never reset.</p>
        </div>
        <LiveLeaderboard
          initialProducts={products}
          page={page}
          pageSize={PAGE_SIZE}
        />
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={productCount ?? products.length}
        />
      </section>

      <section className="mt-14">
        <h2 className="pixel-text mb-4 text-xl uppercase">
          Craft tokens, claim spots
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ways.map((way) => (
            <Link
              key={way.title}
              href={way.href}
              className={`${card} p-5 transition-colors hover:bg-white/5`}
            >
              <h3 className="pixel-text text-base">{way.title}</h3>
              <p className="mt-1 text-sm text-pretty text-mcgray">{way.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
