import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  SHARE_X_TOKENS,
  VISIT_TOKENS,
  WELCOME_TOKENS,
  formatTokens,
} from "@/lib/tokens";
import type { TokenEvent } from "@/lib/types";
import { btnSecondary, card } from "@/lib/ui";
import ShareClaimForm from "@/components/ShareClaimForm";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<TokenEvent["kind"], string> = {
  welcome: "Listed your first product",
  share_x: "Shared LaunchBid on X",
  visit: "Visited a product",
  purchase: "Bought tokens",
  boost: "Bid on a product",
};

export default async function EarnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let balance = 0;
  let events: TokenEvent[] = [];
  let shareClaimed = false;
  if (user) {
    const [{ data: profile }, { data: eventsData }] = await Promise.all([
      supabase.from("profiles").select("token_balance").eq("id", user.id).single(),
      supabase
        .from("token_events")
        .select("id, delta, kind, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);
    balance = Number(profile?.token_balance ?? 0);
    events = (eventsData ?? []) as TokenEvent[];
    shareClaimed = events.some((e) => e.kind === "share_x");
  }

  const shareText = encodeURIComponent(
    `The top 10 spots on this board are literally for sale. I'm bidding my product to #1 on LaunchBid — outbid me: ${process.env.NEXT_PUBLIC_SITE_URL}`
  );
  const intentUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div className="mx-auto max-w-lg pt-12">
      <h1 className="text-2xl font-semibold">Earn tokens</h1>
      <p className="mt-1 text-base text-pretty text-stone-500 dark:text-stone-400">
        Tokens are bids. Three free ways to stack them — no payment needed.
      </p>

      <div className={`${card} mt-6 flex items-center justify-between px-6 py-4`}>
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
          Your balance
        </span>
        <span className="text-xl font-semibold tabular-nums">
          {formatTokens(balance)}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <section className={`${card} p-6`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold">Share LaunchBid on X</h2>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-500 dark:text-stone-400">
              +{SHARE_X_TOKENS} ⚡
            </span>
          </div>
          {shareClaimed ? (
            <p className="mt-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
              Claimed — thanks for spreading the word.
            </p>
          ) : (
            <>
              <p className="mt-1 mb-4 text-sm text-pretty text-stone-500 dark:text-stone-400">
                Post about LaunchBid, paste the link to your post, claim once.
              </p>
              <a
                href={intentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnSecondary} mb-3`}
              >
                Write the post ↗
              </a>
              <ShareClaimForm />
            </>
          )}
        </section>

        <section className={`${card} p-6`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold">Visit products on the board</h2>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-500 dark:text-stone-400">
              +{VISIT_TOKENS} ⚡ each
            </span>
          </div>
          <p className="mt-1 mb-4 text-sm text-pretty text-stone-500 dark:text-stone-400">
            Click through to any product's site — up to 10 rewarded visits a
            day. Your own products don't count.
          </p>
          <Link href="/" className={btnSecondary}>
            Open the board
          </Link>
        </section>

        <section className={`${card} p-6`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold">List your product</h2>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-500 dark:text-stone-400">
              +{WELCOME_TOKENS} ⚡
            </span>
          </div>
          <p className="mt-1 mb-4 text-sm text-pretty text-stone-500 dark:text-stone-400">
            Your first listing comes with a welcome bonus — enough to place
            your first bids.
          </p>
          <Link href="/submit" className={btnSecondary}>
            List a product
          </Link>
        </section>

        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          In a hurry?{" "}
          <Link href="/tokens" className="font-medium underline">
            Buy a token pack with UPI
          </Link>{" "}
          — from ₹49.
        </p>
      </div>

      {events.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Recent activity</h2>
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex justify-between rounded-lg border border-stone-200 px-4 py-2.5 text-sm dark:border-white/10"
              >
                <span>{KIND_LABELS[event.kind]}</span>
                <span
                  className={`font-medium tabular-nums ${
                    event.delta >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {event.delta >= 0 ? "+" : ""}
                  {event.delta} ⚡
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
