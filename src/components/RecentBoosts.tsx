import type { BoostWithProfile } from "@/lib/types";
import { formatPaise } from "@/lib/money";

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
      <p className="text-sm opacity-60 text-center py-4">
        No boosts yet — be the first to put money on it.
      </p>
    );
  }

  return (
    <section>
      <h2 className="font-semibold mb-3">Recent boosts</h2>
      <ul className="space-y-2 text-sm">
        {boosts.map((boost) => (
          <li
            key={boost.id}
            className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-4 py-2.5"
          >
            <span className="truncate">
              <span className="font-medium">
                {boost.profiles?.display_name ?? "Someone"}
              </span>{" "}
              boosted{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {formatPaise(boost.amount)}
              </span>
            </span>
            <span className="opacity-50 shrink-0 ml-3">{timeAgo(boost.created_at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
