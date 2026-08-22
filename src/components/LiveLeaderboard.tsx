"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import { timeAgo } from "@/lib/format";
import { btnPrimary, btnSolid } from "@/lib/ui";
import PixelFace from "./PixelFace";

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function PodiumCard({
  product,
  rank,
}: {
  product: Product;
  rank: number;
}) {
  const center = rank === 1;
  return (
    <div
      className={`mc-panel flex flex-col items-center p-5 text-center ${
        center ? "border-gold/60 sm:order-2 sm:-mt-4" : rank === 2 ? "sm:order-1 sm:mt-6" : "sm:order-3 sm:mt-6"
      }`}
    >
      {center && (
        <span aria-hidden className="crown-float pixel-text -mt-1 mb-1 text-xl">
          👑
        </span>
      )}
      <a
        href={`/go/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer nofollow"
        title={`Open ${host(product.url)}: you earn 2 tokens`}
        className="flex flex-col items-center gap-2 hover:underline"
      >
        <PixelFace seed={product.slug} size={center ? 64 : 48} tokens={Number(product.total_amount)} />
        <span className="pixel-text max-w-44 truncate text-base">
          {product.name}
        </span>
      </a>
      <span
        className={`pixel-text mt-1 text-lg tabular-nums ${
          center ? "text-gold" : "text-mcgray"
        }`}
      >
        {formatTokens(product.total_amount)}
      </span>
      <span className="mt-0.5 text-sm text-mcdim">
        #{rank} · {product.click_count} click
        {product.click_count === 1 ? "" : "s"}
      </span>
      <Link href={`/p/${product.slug}#boost`} className={`${btnSolid} mt-3`}>
        Outbid
      </Link>
    </div>
  );
}

export default function LiveLeaderboard({
  initialProducts,
  page,
  pageSize,
}: {
  initialProducts: Product[];
  page: number;
  pageSize: number;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const offset = (page - 1) * pageSize;

  useEffect(() => {
    const supabase = (supabaseRef.current ??= createClient());

    const refetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("total_amount", { ascending: false })
        .order("created_at", { ascending: true })
        .range(offset, offset + pageSize - 1);
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
  }, [offset, pageSize]);

  if (products.length === 0) {
    return (
      <div className="mc-panel border-dashed py-16 text-center">
        <p className="pixel-text text-base">The server is empty.</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-mcgray">
          Share once on X for 50 ⚡, spawn your product for 25, and a 5 ⚡ bid
          takes #1.
        </p>
        <Link href="/#hero-url" className={`${btnPrimary} mt-5`}>
          Claim the top spot
        </Link>
      </div>
    );
  }

  const podium = page === 1 ? products.slice(0, 3) : [];
  const rows = page === 1 ? products.slice(3) : products;
  const rowOffset = page === 1 ? 3 : offset;

  return (
    <div>
      {podium.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {podium.map((product, i) => (
            <PodiumCard key={product.id} product={product} rank={i + 1} />
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mc-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black/70 text-left text-xs uppercase text-mcdim">
                <th scope="col" className="px-3 py-3 font-normal sm:px-4">
                  #
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">
                  Product
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-normal md:table-cell">
                  Description
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-normal sm:table-cell">
                  Clicks
                </th>
                <th scope="col" className="hidden py-3 pr-4 font-normal sm:table-cell">
                  Last bid
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">
                  Tokens
                </th>
                <th scope="col" className="py-3 pr-4">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product, i) => {
                const rank = rowOffset + i + 1;
                return (
                  <tr
                    key={product.id}
                    className="border-b-2 border-black/40 transition-colors last:border-b-0 hover:bg-white/5"
                  >
                    <td className="pixel-text px-3 py-3.5 text-base tabular-nums text-mcgray sm:px-4">
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
                        <PixelFace seed={product.slug} size={36} tokens={Number(product.total_amount)} />
                        <span className="pixel-text max-w-36 truncate text-base sm:max-w-56">
                          {product.name}
                        </span>
                      </a>
                    </td>
                    <td className="hidden max-w-72 truncate py-3.5 pr-4 text-mcgray md:table-cell">
                      {product.tagline ?? host(product.url)}
                    </td>
                    <td className="hidden py-3.5 pr-4 tabular-nums text-mcgray sm:table-cell">
                      {product.click_count}
                    </td>
                    <td className="hidden py-3.5 pr-4 text-mcgray sm:table-cell">
                      {product.last_boost_at
                        ? timeAgo(product.last_boost_at)
                        : "new"}
                    </td>
                    <td className="pixel-text py-3.5 pr-4 text-right text-base tabular-nums">
                      {formatTokens(product.total_amount)}
                    </td>
                    <td className="py-3.5 pr-3 text-right sm:pr-4">
                      <Link href={`/p/${product.slug}#boost`} className="mc-btn px-2.5 py-2 text-sm sm:px-4">
                        Outbid
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
