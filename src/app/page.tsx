import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import QuickTopUp from "@/components/QuickTopUp";
import Pagination from "@/components/Pagination";
import { SHARE_X_TOKENS, TOKEN_PACKS, VISIT_TOKENS, formatTokens } from "@/lib/tokens";
import { btnPrimary, card } from "@/lib/ui";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const FAQS = [
  {
    q: "What is LaunchBid?",
    a: "LaunchBid is a live product leaderboard where makers promote their product by bidding tokens on it. There are no upvotes and no algorithm: the products with the most tokens bid hold the top spots.",
  },
  {
    q: "How does the ranking work?",
    a: "Every token bid on a product adds to its lifetime total, and the board ranks products by that total. Totals never reset, and anyone can outbid anyone at any time.",
  },
  {
    q: "How do I get tokens?",
    a: "Complete quests for free tokens: share LaunchBid on X for 50 tokens (verified instantly) or earn 2 tokens for each product you visit from the board. You can also buy UPI token packs from Rs 49.",
  },
  {
    q: "What does it cost to list my product?",
    a: "Spawning a product onto the leaderboard costs 25 tokens. One share quest covers it with 25 tokens left over for your first bids.",
  },
  {
    q: "Do I need an account?",
    a: "No sign-up and no password. Your browser gets an identity automatically, and your email is only used to confirm token purchases.",
  },
];


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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const boardJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "LaunchBid server leaderboard",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: offset + i + 1,
      name: p.name,
      url: `https://launchbid.lol/p/${p.slug}`,
    })),
  };

  return (
    <div className="pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqJsonLd, boardJsonLd]) }}
      />
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
        <p className="mt-3 text-sm font-medium text-gold">
          Spawning takes 25 ⚡. One X share earns you 50, instantly. No sign-up.
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

      <div className="mt-5 flex justify-center">
        <QuickTopUp
          packs={TOKEN_PACKS.map(({ inr, tokens }) => ({ inr, tokens }))}
        />
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

      <section className="mt-14">
        <h2 className="pixel-text mb-4 text-xl uppercase">Wiki</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="mc-panel group px-5 py-4">
              <summary className="cursor-pointer list-none text-base font-semibold marker:content-none">
                <span className="mr-2 text-gold group-open:hidden">+</span>
                <span className="mr-2 hidden text-gold group-open:inline">-</span>
                {q}
              </summary>
              <p className="mt-2 text-sm text-pretty text-mcgray">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
