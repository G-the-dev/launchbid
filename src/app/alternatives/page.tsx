import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export const metadata = {
  title: "Pay-to-rank sites compared: outbid.lol, uprank and the wave",
  description:
    "Every bid-to-rank leaderboard compared: outbid.lol, uprank.lol, outbid.to, bidboard, topbids, milliboard and more, and how LaunchBid differs with free token quests, UPI payments and a top-10 board.",
  alternates: { canonical: "/alternatives" },
};

const SITES = [
  ["LaunchBid", "Cumulative token bids, top-10 board", "Tokens: earn free or buy (UPI from Rs 49)", "Free listing via one verified share, quests, Minecraft theme, public click counts"],
  ["outbid.lol", "Cumulative standing bids, endless list", "USD cards", "The original of the 2026 wave; no accounts, no free path"],
  ["uprank.lol", "Cumulative lifetime totals", "USD cards", "Shows cost-per-click on rows; no free way to list"],
  ["outbid.to", "Single-bid auction", "USD cards", "Listed until outbid"],
  ["bidboard.lol", "Auction plus a free dofollow link", "USD cards", "SEO-link angle"],
  ["topbids.lol", "Cumulative totals per URL", "USD cards", "Paid tiers unlock custom pitch"],
  ["milliboard.com", "Biggest single payment wins podium", "USD cards", "Board freezes forever at its goal"],
  ["biddirectory.lol", "Directory of bid sites, ranked by bid", "USD cards", "A leaderboard of leaderboards"],
] as const;

export default function AlternativesPage() {
  return (
    <div className="pt-12">
      <h1 className="pixel-text text-2xl uppercase">Pay-to-rank sites, compared</h1>
      <p className="mt-2 max-w-2xl text-base text-pretty text-mcgray">
        Since outbid.lol lit the fuse, a wave of bid-to-rank leaderboards has
        appeared, many on .lol domains. They share one honest idea: rank is
        decided by money, not votes. Here is how the boards differ, and where
        LaunchBid fits if you are looking for an outbid or uprank alternative.
      </p>

      <div className="mc-panel mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black/70 text-left text-xs uppercase text-mcdim">
              <th className="px-4 py-3 font-normal">Site</th>
              <th className="py-3 pr-4 font-normal">Ranking model</th>
              <th className="py-3 pr-4 font-normal">Payment</th>
              <th className="py-3 pr-4 font-normal">Notable</th>
            </tr>
          </thead>
          <tbody>
            {SITES.map(([site, model, pay, notable]) => (
              <tr
                key={site}
                className={`border-b-2 border-black/40 last:border-b-0 ${
                  site === "LaunchBid" ? "bg-white/[0.05]" : ""
                }`}
              >
                <td className={`px-4 py-3 whitespace-nowrap ${site === "LaunchBid" ? "pixel-text text-gold" : "font-semibold"}`}>
                  {site}
                </td>
                <td className="py-3 pr-4 text-mcgray">{model}</td>
                <td className="py-3 pr-4 text-mcgray">{pay}</td>
                <td className="py-3 pr-4 text-mcgray">{notable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-10 max-w-2xl">
        <h2 className="pixel-text text-xl uppercase">Why makers pick LaunchBid</h2>
        <ul className="mt-4 space-y-2 text-sm text-pretty text-mcgray">
          <li>• The only board with a free path: one verified share on X earns enough tokens to list, and explore quests fund your first bids.</li>
          <li>• UPI payments from Rs 49, built for India; most of the wave takes USD cards only.</li>
          <li>• A top-10 board where every visible spot matters, instead of an endless tail of forgotten listings.</li>
          <li>• Public click counts on every listing, so you can see what your rank actually delivers.</li>
          <li>• It is a Minecraft world, with skins, sounds and a crown. Promotion does not have to be boring.</li>
        </ul>
        <p className="mt-6 text-sm text-pretty text-mcdim">
          The wave keeps growing, with names like rankup, aurabid, firstbid,
          rankbid, topclick, toppick and dozens more appearing across .lol
          domains. However many boards exist, the rule is the same everywhere:
          the top spot goes to whoever wants it most.
        </p>
        <div className="mt-8">
          <Link href="/#hero-url" className={btnPrimary}>
            Spawn your product on LaunchBid
          </Link>
        </div>
      </section>
    </div>
  );
}
