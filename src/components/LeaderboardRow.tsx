import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPaise } from "@/lib/money";
import Favicon from "./Favicon";

const MEDALS: Record<number, string> = {
  1: "bg-amber-400 text-black",
  2: "bg-zinc-300 text-black",
  3: "bg-orange-300 text-black",
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
    <li className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-4 py-3">
      <span
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          MEDALS[rank] ?? "bg-black/5 dark:bg-white/10"
        }`}
      >
        {rank}
      </span>
      <Favicon src={product.favicon_url} name={product.name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            href={`/p/${product.slug}`}
            className="font-semibold truncate hover:underline"
          >
            {product.name}
          </Link>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-xs opacity-50 hover:opacity-100 truncate"
          >
            {host} ↗
          </a>
        </div>
        {product.tagline && (
          <p className="text-sm opacity-70 truncate">{product.tagline}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold tabular-nums">
          {formatPaise(product.total_amount)}
        </div>
        <Link
          href={`/p/${product.slug}`}
          className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
        >
          Boost ↑
        </Link>
      </div>
    </li>
  );
}
