"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { btnPrimary } from "@/lib/ui";
import LeaderboardRow from "./LeaderboardRow";

export default function LiveLeaderboard({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    const supabase = (supabaseRef.current ??= createClient());

    const refetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("total_amount", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10);
      if (data) setProducts(data as Product[]);
    };

    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => refetch()
      )
      .subscribe();

    const interval = setInterval(refetch, 25_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center">
        <p className="text-base font-medium">The board is empty.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-zinc-400">
          The first product listed takes #1 for just 5 tokens — and you get 25
          free for listing.
        </p>
        <Link href="/submit" className={`${btnPrimary} mt-5`}>
          Claim the top spot
        </Link>
      </div>
    );
  }

  return (
    <ol className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {products.map((product, i) => (
        <LeaderboardRow key={product.id} product={product} rank={i + 1} />
      ))}
    </ol>
  );
}
