"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import { timeAgo } from "@/lib/format";
import { btnPrimary, btnSolid } from "@/lib/ui";
import Favicon from "./Favicon";

const RANK_COLORS: Record<number, string> = {
  1: "text-zinc-50",
  2: "text-zinc-300",
  3: "text-zinc-400",
};

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

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
          The first product listed takes #1 for just 5 tokens, and listing
          itself earns you 25.
        </p>
        <Link href="/submit" className={`${btnPrimary} mt-5`}>
          Claim the top spot
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left font-mono text-xs uppercase tracking-wider text-zinc-500">
            <th scope="col" className="px-4 py-3 font-medium">
              #
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Product
            </th>
            <th scope="col" className="hidden py-3 pr-4 font-medium md:table-cell">
              Description
            </th>
            <th scope="col" className="hidden py-3 pr-4 font-medium sm:table-cell">
              Clicks
            </th>
            <th scope="col" className="hidden py-3 pr-4 font-medium sm:table-cell">
              Last bid
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Tokens
            </th>
            <th scope="col" className="py-3 pr-4">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => {
            const rank = i + 1;
            return (
              <tr
                key={product.id}
                className={`border-b border-zinc-800 transition-colors last:border-b-0 hover:bg-zinc-800/40 ${
                  rank === 1 ? "bg-white/[0.04]" : ""
                }`}
              >
                <td
                  className={`px-4 py-3.5 font-mono text-base font-bold tabular-nums ${
                    RANK_COLORS[rank] ?? "text-zinc-500"
                  }`}
                >
                  #{rank}
                </td>
                <td className="py-3.5 pr-4">
                  <a
                    href={`/go/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-3 hover:underline"
                    title={`Open ${host(product.url)}: you earn 2 tokens`}
                  >
                    <Favicon
                      src={product.favicon_url}
                      name={product.name}
                      size={36}
                    />
                    <span className="max-w-56 truncate text-base font-semibold">
                      {product.name}
                    </span>
                  </a>
                </td>
                <td className="hidden max-w-72 truncate py-3.5 pr-4 text-zinc-400 md:table-cell">
                  {product.tagline ?? host(product.url)}
                </td>
                <td className="hidden py-3.5 pr-4 font-mono tabular-nums text-zinc-400 sm:table-cell">
                  {product.click_count}
                </td>
                <td className="hidden py-3.5 pr-4 font-mono text-zinc-400 sm:table-cell">
                  {product.last_boost_at ? timeAgo(product.last_boost_at) : "new"}
                </td>
                <td
                  className={`py-3.5 pr-4 text-right font-mono text-base font-bold tabular-nums ${
                    rank === 1 ? "text-zinc-50" : ""
                  }`}
                >
                  {formatTokens(product.total_amount)}
                </td>
                <td className="py-3.5 pr-4 text-right">
                  <Link href={`/p/${product.slug}#boost`} className={btnSolid}>
                    Outbid
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
