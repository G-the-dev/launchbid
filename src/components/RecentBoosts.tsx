import type { BoostWithProfile } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";

function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RecentBoosts({ boosts }: { boosts: BoostWithProfile[] }) {
  if (boosts.length === 0) {
    return (
      <p className="py-2 text-center text-sm text-stone-500 dark:text-stone-400">
        No bids yet — the first one sets the price of this spot.
      </p>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Recent bids</h2>
      <ul className="space-y-2">
        {boosts.map((boost) => (
          <li
            key={boost.id}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-stone-900"
          >
            <span className="truncate">
              <span className="font-medium">
                {boost.profiles?.display_name ?? "A backer"}
              </span>{" "}
              bid{" "}
              <span className="font-semibold tabular-nums">
                {formatTokens(boost.amount)}
              </span>
            </span>
            <span className="ml-3 shrink-0 text-stone-500 dark:text-stone-400">
              {timeAgo(boost.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
