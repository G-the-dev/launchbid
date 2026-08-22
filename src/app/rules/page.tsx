import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export const metadata = {
  alternates: { canonical: "/rules" },
  title: "Server rules",
  description: "How LaunchBid ranking works: every token is a bid and totals never reset.",
};

const RULES = [
  "Your rank is your lifetime token total. Totals never reset, and being outbid is not a refund reason.",
  "Anyone can bid on any product at any time. Sinking down the board just means someone wanted your spot more.",
  "Spawning a product costs 25 ⚡ and bids start at 5 ⚡. One verified X share earns 50 ⚡, enough to spawn with 25 to spare.",
  "One listing per URL across the whole server. Resubmitting the same URL is blocked.",
  "Clicks are counted through go-links. Query strings are stripped, so affiliate and tracking URLs won't work here.",
  "Earning caps: the share quest pays once per player and the post must actually mention LaunchBid; explore quests pay for up to 10 visits a day; your own products never pay you.",
  "Token purchases are credited after UPI verification and confirmed to your email.",
  "No chat-invite links (Telegram, WhatsApp, Discord) and no adult content. Rule-breaking listings are removed without refund.",
];


const FAQS = [
  {
    q: "What is LaunchBid?",
    a: "LaunchBid is a live product leaderboard where makers promote their product by bidding tokens on it. There are no upvotes and no algorithm: the products with the most tokens bid hold the top spots.",
  },
  {
    q: "How does the ranking work?",
    a: "Every token bid on a product adds to its lifetime total, and the board ranks products by that total. Totals never reset, and anyone can outbid anyone at any time.",
  },
  {
    q: "How do I get tokens?",
    a: "Complete quests for free tokens: share LaunchBid on X for 50 tokens (verified instantly) or earn 2 tokens for each product you visit from the board. You can also buy UPI token packs from Rs 49.",
  },
  {
    q: "What does it cost to list my product?",
    a: "Spawning a product onto the leaderboard costs 25 tokens. One share quest covers it with 25 tokens left over for your first bids.",
  },
  {
    q: "Where can I promote my product for free?",
    a: "Free options include launch platforms like Product Hunt and Peerlist, Show HN on Hacker News, maker communities on Reddit and X, and LaunchBid, where one verified share on X earns enough tokens to list your product on the live leaderboard without paying anything.",
  },
  {
    q: "How do I get the first users for my product?",
    a: "Put your product where makers and early adopters already look: launch directories, communities, and leaderboards. Ship a clear one-line pitch, share it publicly, and engage everyone who responds. On LaunchBid, every listing gets clicks from the board and its click count is public.",
  },
  {
    q: "How much does it cost to promote a product online?",
    a: "Anywhere from nothing to thousands. Community launches and directories are free, featured directory spots run 29 to 400 dollars, and ads scale infinitely. LaunchBid starts free via share quests, and paid token packs begin at Rs 49, so you control the exact spend.",
  },
  {
    q: "What is a pay-to-rank leaderboard?",
    a: "A pay-to-rank leaderboard ranks listings by how much has been spent on them instead of votes or algorithms. On LaunchBid, every token bid on a product adds to its lifetime total, the board sorts by that total, and anyone can outbid anyone at any time.",
  },
  {
    q: "Is LaunchBid a Product Hunt alternative?",
    a: "Yes, for makers who want certainty. On upvote sites like Product Hunt your launch depends on votes and timing; on LaunchBid you bid tokens and the leaderboard rank is exactly what you paid for. Totals never reset, so your position compounds.",
  },
  {
    q: "How is LaunchBid different from outbid.lol and other bid-to-rank sites?",
    a: "Same honest idea: outbid others to rank higher. LaunchBid adds free token quests, UPI payments for India, a Minecraft theme, click tracking on every listing, and a top-10 board where every visible spot matters.",
  },
  {
    q: "Do I need an account?",
    a: "No sign-up and no password. Your browser gets an identity automatically, and your email is only used to confirm token purchases.",
  },
];

export default function RulesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="mt-10">
        <h2 className="pixel-text mb-4 text-xl uppercase">Wiki</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="mc-panel group px-5 py-4">
              <summary className="cursor-pointer list-none text-base font-semibold marker:content-none">
                <span className="mr-2 text-gold group-open:hidden">+</span>
                <span className="mr-2 hidden text-gold group-open:inline">-</span>
                {q}
              </summary>
              <p className="mt-2 text-sm text-pretty text-mcgray">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-6 text-center">
        <Link href="/#hero-url" className={btnPrimary}>
          Spawn your product
        </Link>
      </div>
    </div>
  );
}
