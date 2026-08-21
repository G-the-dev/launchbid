import { createClient } from "@/lib/supabase/server";
import LiveLeaderboard from "@/components/LiveLeaderboard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("total_amount", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(10);

  const products = (data ?? []) as Product[];

  return (
    <div className="pt-10">
      <section className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          The leaderboard <span className="text-amber-500">money built</span>
        </h1>
        <p className="mt-3 opacity-70 max-w-md mx-auto">
          No upvotes. No algorithms. The top 10 products are the ones that bid
          the most tokens — earn tokens by sharing and exploring, or buy them
          with UPI, and outbid the board.
        </p>
      </section>
      <LiveLeaderboard initialProducts={products} />
    </div>
  );
}
