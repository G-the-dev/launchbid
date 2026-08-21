import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import Favicon from "./Favicon";

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

  const medal =
    rank === 1
      ? "bg-amber-500 text-stone-950"
      : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300";

  return (
    <li>
      <div
        className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-3 transition-colors hover:border-stone-300 dark:bg-stone-900 dark:hover:border-white/20 ${
          rank === 1
            ? "border-amber-500/50"
            : "border-stone-200 dark:border-white/10"
        }`}
      >
        <span
          aria-label={`Rank ${rank}`}
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${medal}`}
        >
          {rank}
        </span>
        <Favicon src={product.favicon_url} name={product.name} size={40} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/p/${product.slug}`}
            className="block truncate text-base font-medium hover:underline"
          >
            {product.name}
          </Link>
          <p className="truncate text-sm text-stone-500 dark:text-stone-400">
            {product.tagline ? `${product.tagline} · ` : ""}
            {product.click_count} click{product.click_count === 1 ? "" : "s"} ·{" "}
            <a
              href={`/go/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:text-stone-900 hover:underline dark:hover:text-stone-100"
              title="Visit — you earn 2 tokens"
            >
              {host} ↗
            </a>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-base font-semibold tabular-nums">
            {formatTokens(product.total_amount)}
          </div>
          <Link
            href={`/p/${product.slug}#boost`}
            className="text-sm font-medium text-stone-500 hover:text-stone-900 hover:underline dark:text-stone-400 dark:hover:text-stone-100"
          >
            Outbid
          </Link>
        </div>
      </div>
    </li>
  );
}
