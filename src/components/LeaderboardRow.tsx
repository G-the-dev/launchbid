import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import { btnSolid } from "@/lib/ui";
import Favicon from "./Favicon";

const RANK_COLORS: Record<number, string> = {
  1: "text-zinc-50",
  2: "text-zinc-300",
  3: "text-zinc-400",
};

export default function LeaderboardRow({
  product,
  rank,
}: {
  product: Product;
  rank: number;
}) {
  let host = "";
  try {
    host = new URL(product.url).hostname.replace(/^www\./, "");
  } catch {
    host = product.url;
  }

  return (
    <li
      className={`flex items-center gap-4 border-b border-zinc-800 px-4 py-4 transition-colors last:border-b-0 hover:bg-zinc-800/40 ${
        rank === 1 ? "bg-white/[0.04]" : ""
      }`}
    >
      <span
        aria-label={`Rank ${rank}`}
        className={`w-8 shrink-0 text-center text-lg font-bold tabular-nums ${
          RANK_COLORS[rank] ?? "text-zinc-500"
        }`}
      >
        {rank}
      </span>
      <Favicon src={product.favicon_url} name={product.name} size={44} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/p/${product.slug}`}
          className="block truncate text-base font-semibold hover:underline"
        >
          {product.name}
        </Link>
        <p className="truncate text-sm text-zinc-400">
          {product.tagline ? `${product.tagline} · ` : ""}
          <a
            href={`/go/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="hover:text-zinc-100 hover:underline"
            title="Visit — you earn 2 tokens"
          >
            {host} ↗
          </a>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-lg font-bold tabular-nums">
          {formatTokens(product.total_amount)}
        </div>
        <div className="text-xs text-zinc-500">
          {product.click_count} click{product.click_count === 1 ? "" : "s"}
        </div>
      </div>
      <Link
        href={`/p/${product.slug}#boost`}
        className={`${btnSolid} shrink-0`}
      >
        Outbid
      </Link>
    </li>
  );
}
