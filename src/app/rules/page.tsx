import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export const metadata = { title: "Server rules: LaunchBid" };

const RULES = [
  "Your rank is your lifetime token total. Totals never reset, and being outbid is not a refund reason.",
  "Anyone can bid on any product at any time. Sinking down the board just means someone wanted your spot more.",
  "Spawning a product costs 25 ⚡ and bids start at 5 ⚡. One verified X share earns 50 ⚡, enough to spawn with 25 to spare.",
  "One listing per URL across the whole server. Resubmitting the same URL is blocked.",
  "Clicks are counted through go-links. Query strings are stripped, so affiliate and tracking URLs won't work here.",
  "Earning caps: the share quest pays once per player and the post must actually mention LaunchBid; explore quests pay for up to 10 visits a day; your own products never pay you.",
  "Token purchases are credited automatically after card checkout and confirmed to your email.",
  "No chat-invite links (Telegram, WhatsApp, Discord) and no adult content. Rule-breaking listings are removed without refund.",
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-lg pt-12">
      <h1 className="pixel-text text-2xl uppercase">Server rules</h1>
      <p className="mt-1 mb-6 text-base text-mcgray">
        Short version: every token is a bid, the board never lies.
      </p>
      <ol className="mc-panel space-y-4 p-6 text-sm">
        {RULES.map((rule, i) => (
          <li key={i} className="flex gap-3">
            <span className="pixel-text shrink-0 text-gold tabular-nums">
              {i + 1}.
            </span>
            <span className="text-pretty">{rule}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 text-center">
        <Link href="/#hero-url" className={btnPrimary}>
          Spawn your product
        </Link>
      </div>
    </div>
  );
}
