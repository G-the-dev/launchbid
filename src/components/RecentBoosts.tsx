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
      <p className="py-2 text-center text-sm text-zinc-400">
        No bids yet. The first one sets the price of this spot.
      </p>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Recent bids</h2>
      <ul className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        {boosts.map((boost) => (
          <li
            key={boost.id}
            className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-sm last:border-b-0"
          >
            <span className="truncate">
              <span className="font-medium">
                {boost.profiles?.display_name ?? "A backer"}
              </span>{" "}
              bid{" "}
              <span className="font-semibold tabular-nums text-zinc-100">
                {formatTokens(boost.amount)}
              </span>
            </span>
            <span className="ml-3 shrink-0 text-zinc-500">
              {timeAgo(boost.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
