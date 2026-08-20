"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
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

    // Polling fallback in case realtime is unavailable
    const interval = setInterval(refetch, 25_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-black/20 dark:border-white/20 rounded-2xl opacity-70">
        <p className="font-medium">The board is empty.</p>
        <p className="text-sm mt-1">Submit your product and claim #1 for ₹10.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {products.map((product, i) => (
        <LeaderboardRow key={product.id} product={product} rank={i + 1} />
      ))}
    </ol>
  );
}
