import Link from "next/link";
import { getServerClient, getSessionUser } from "@/lib/data";
import type { Product } from "@/lib/types";
import { btnPrimary } from "@/lib/ui";
import DashboardProductCard from "@/components/DashboardProductCard";

export const metadata = { title: "My products", robots: { index: false } };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await getServerClient();
  const user = await getSessionUser();

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
        <h1 className="pixel-text text-2xl uppercase">My products</h1>
        {products.length > 0 && (
          <Link href="/#hero-url" className="text-sm font-medium underline">
            List another
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-none border border-dashed border-mcdim py-16 text-center">
          <p className="text-base font-medium">Nothing spawned from this browser yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-mcgray">
            Spawning costs 25 ⚡ and one verified X share earns 50. Start
            climbing the board.
          </p>
          <Link href="/#hero-url" className={`${btnPrimary} mt-5`}>
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
