import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import DashboardProductCard from "@/components/DashboardProductCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("owner_id", user.id)
    .order("total_amount", { ascending: false });
  const products = (data ?? []) as Product[];

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My products</h1>
        <Link
          href="/submit"
          className="text-sm rounded-full bg-amber-500 text-black font-medium px-4 py-1.5 hover:bg-amber-400 transition-colors"
        >
          Submit another
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/20 dark:border-white/20 rounded-2xl opacity-70">
          <p className="font-medium">Nothing listed yet.</p>
          <p className="text-sm mt-1">
            <Link href="/submit" className="underline">
              Submit your product
            </Link>{" "}
            and start climbing the board.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
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
