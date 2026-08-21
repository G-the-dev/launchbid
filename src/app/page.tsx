import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import { formatTokens } from "@/lib/tokens";
import { btnPrimary } from "@/lib/ui";
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

  return (
    <div className="pt-12">
      <section className="text-center">
        <h1 className="text-4xl font-semibold text-balance">
          The top 10 spots on this board are for sale
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-pretty text-stone-500 dark:text-stone-400">
          No upvotes, no algorithm. Products rank by tokens bid on them —
          earn tokens free or buy them with UPI, then outbid the board.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/submit" className={btnPrimary}>
            List your product — 25 tokens free
          </Link>
        </div>
      </section>

      <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-stone-200 bg-stone-200 text-center dark:border-white/10 dark:bg-white/10">
        {[
          { k: "Tokens bid", v: formatTokens(totalBid) },
          { k: "Products", v: String(productCount ?? products.length) },
          { k: "Boosts placed", v: String(boostCount ?? 0) },
        ].map(({ k, v }) => (
          <div key={k} className="bg-background px-2 py-3">
            <dd className="text-base font-semibold tabular-nums">{v}</dd>
            <dt className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{k}</dt>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">The board</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Updates live · visit a product, earn 2 ⚡
          </p>
        </div>
        <LiveLeaderboard initialProducts={products} />
      </section>
    </div>
  );
}
