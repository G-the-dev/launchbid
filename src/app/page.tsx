import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroShader from "@/components/HeroShader";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import { SHARE_X_TOKENS, VISIT_TOKENS, formatTokens } from "@/lib/tokens";
import { btnPrimary, card } from "@/lib/ui";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [{ data }, { count: productCount }, { count: boostCount }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("total_amount", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("boosts").select("*", { count: "exact", head: true }),
    ]);

  const products = (data ?? []) as Product[];
  const totalBid = products.reduce((sum, p) => sum + Number(p.total_amount), 0);

  const ways = [
    {
      title: "Share & earn",
      desc: `Post LaunchBid on X and claim +${SHARE_X_TOKENS} ⚡`,
      href: "/earn",
    },
    {
      title: "Explore & earn",
      desc: `+${VISIT_TOKENS} ⚡ for every product you visit`,
      href: "/earn",
    },
    {
      title: "Refill anytime",
      desc: "UPI packs from ₹49. Scan, pay, done.",
      href: "/tokens",
    },
  ];

  return (
    <div className="pt-14">
      <section className="relative py-10 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-6.5rem] left-1/2 -z-10 h-[26rem] w-screen -translate-x-1/2 overflow-hidden"
        >
          <HeroShader />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/20 to-background" />
        </div>
        <h1 className="text-4xl font-semibold text-balance">
          Bid your product to <span className="underline decoration-zinc-600 decoration-2 underline-offset-8">#1</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-pretty text-zinc-400">
          A live leaderboard where tokens are bids. Earn tokens free or refill
          with UPI, then outbid the board for the top spot.
        </p>

        <form
          action="/submit"
          method="get"
          className="mx-auto mt-7 flex max-w-md gap-2"
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
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3.5 py-2.5 text-base text-zinc-50 outline-none backdrop-blur transition-colors placeholder:text-zinc-500 focus:border-zinc-400"
          />
          <button type="submit" className={`${btnPrimary} shrink-0`}>
            List it free
          </button>
        </form>
        <p className="mt-3 text-sm text-zinc-500">
          Your first listing earns 25 ⚡. No sign-up.
        </p>
      </section>

      <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 text-center">
        {[
          { k: "Tokens bid", v: formatTokens(totalBid) },
          { k: "Products", v: String(productCount ?? products.length) },
          { k: "Boosts placed", v: String(boostCount ?? 0) },
        ].map(({ k, v }) => (
          <div key={k} className="bg-zinc-900 px-2 py-3.5">
            <div className="text-base font-semibold tabular-nums">{v}</div>
            <div className="mt-0.5 text-sm text-zinc-400">{k}</div>
          </div>
        ))}
      </div>

      <section className="relative left-1/2 mt-14 w-screen max-w-5xl -translate-x-1/2 px-4">
        <div className="mb-3 flex items-baseline justify-between font-mono text-xs uppercase">
          <h2 className="font-semibold tracking-wider text-zinc-100">
            Lifetime ranking
          </h2>
          <p className="tracking-wider text-zinc-500">Totals never reset.</p>
        </div>
        <LiveLeaderboard initialProducts={products} />
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-xl font-semibold">Stack tokens, take spots</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {ways.map((way) => (
            <Link
              key={way.title}
              href={way.href}
              className={`${card} group p-5 transition-colors hover:border-zinc-500`}
            >
              <h3 className="text-base font-semibold">{way.title}</h3>
              <p className="mt-1 text-sm text-pretty text-zinc-400">{way.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
