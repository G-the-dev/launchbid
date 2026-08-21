import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  SHARE_X_TOKENS,
  VISIT_TOKENS,
  WELCOME_TOKENS,
  formatTokens,
} from "@/lib/tokens";
import type { TokenEvent } from "@/lib/types";
import ShareClaimForm from "@/components/ShareClaimForm";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<TokenEvent["kind"], string> = {
  welcome: "Listed your first product",
  share_x: "Shared LaunchBid on X",
  visit: "Checked out a product",
  purchase: "Bought tokens",
  boost: "Boosted a product",
};

export default async function EarnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/earn");

  const [{ data: profile }, { data: eventsData }] = await Promise.all([
    supabase.from("profiles").select("token_balance").eq("id", user.id).single(),
    supabase
      .from("token_events")
      .select("id, delta, kind, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);
  const balance = Number(profile?.token_balance ?? 0);
  const events = (eventsData ?? []) as TokenEvent[];

  const shareText = encodeURIComponent(
    `The leaderboard money built 🏆 I'm bidding my product to the top of @LaunchBid — every token is a vote. Outbid me: ${process.env.NEXT_PUBLIC_SITE_URL}`
  );
  const intentUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div className="pt-12 max-w-lg mx-auto">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-bold">Earn tokens</h1>
        <span className="tabular-nums font-semibold">{formatTokens(balance)}</span>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Share LaunchBid on X</h2>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              +{SHARE_X_TOKENS} ⚡
            </span>
          </div>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Post about LaunchBid, paste the link to your post, and claim. One
            time per account.
          </p>
          <a
            href={intentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-foreground text-background text-sm font-medium px-4 py-2 mb-3"
          >
            Post on X ↗
          </a>
          <ShareClaimForm />
        </section>

        <section className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Check out other products</h2>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              +{VISIT_TOKENS} ⚡ each
            </span>
          </div>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Visit any product from the board (click its link) and earn — up to
            10 rewarded visits a day. Your own products don&apos;t count.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl border border-black/15 dark:border-white/15 text-sm font-medium px-4 py-2 hover:border-amber-500"
          >
            Browse the board
          </Link>
        </section>

        <section className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">List your product</h2>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              +{WELCOME_TOKENS} ⚡
            </span>
          </div>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Your first listing comes with a welcome bonus.
          </p>
          <Link
            href="/submit"
            className="inline-block rounded-xl border border-black/15 dark:border-white/15 text-sm font-medium px-4 py-2 hover:border-amber-500"
          >
            Submit a product
          </Link>
        </section>

        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
          <h2 className="font-semibold">Need more, faster?</h2>
          <p className="text-sm opacity-70 mt-1 mb-3">
            Buy a token pack with UPI — scan, pay, done.
          </p>
          <Link
            href="/tokens"
            className="inline-block rounded-xl bg-amber-500 text-black text-sm font-semibold px-4 py-2 hover:bg-amber-400"
          >
            Buy tokens
          </Link>
        </section>
      </div>

      {events.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold mb-3">Recent activity</h2>
          <ul className="space-y-1.5 text-sm">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex justify-between rounded-lg border border-black/10 dark:border-white/10 px-3 py-2"
              >
                <span>{KIND_LABELS[event.kind]}</span>
                <span
                  className={`tabular-nums font-medium ${
                    event.delta >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "opacity-70"
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
