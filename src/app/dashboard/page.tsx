import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { btnPrimary } from "@/lib/ui";
import DashboardProductCard from "@/components/DashboardProductCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  let products: Product[] = [];
  if (user) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("owner_id", user.id)
      .order("total_amount", { ascending: false });
    products = (data ?? []) as Product[];
  }

  const ranks = await Promise.all(
    products.map(async (product) => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .gt("total_amount", product.total_amount);
      return (count ?? 0) + 1;
    })
  );

  return (
    <div className="pt-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">My products</h1>
        {products.length > 0 && (
          <Link href="/submit" className="text-sm font-medium underline">
            List another
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center">
          <p className="text-base font-medium">Nothing listed from this browser yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-zinc-400">
            List your product to start climbing the board. It comes with 25
            free tokens.
          </p>
          <Link href="/submit" className={`${btnPrimary} mt-5`}>
            List your product
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {products.map((product, i) => (
            <DashboardProductCard
              key={product.id}
              product={product}
              rank={ranks[i]}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
