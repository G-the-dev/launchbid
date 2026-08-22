"use client";

import Link from "next/link";

type UpiPack = { inr: number; tokens: number };

// One-line refill row for the homepage: each pack deep-links into the token
// shop with that pack preselected and its UPI QR ready to scan.
// (The card-checkout version of this component lives in git history for when
// the Dodo merchant account goes live.)
export default function QuickTopUp({
  packs,
  heading = "Quick refill",
}: {
  packs: UpiPack[];
  heading?: string;
}) {
  if (packs.length === 0) return null;

  return (
    <div className="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-sm text-mcgray">{heading}:</span>
      <div className="flex flex-wrap gap-1.5">
        {packs.map((pack) => (
          <Link
            key={pack.inr}
            href={`/tokens?pack=${pack.inr}`}
            className="mc-btn px-2.5 py-1.5 text-xs whitespace-nowrap"
          >
            ₹{pack.inr}
            <span className="opacity-75 tabular-nums">· {pack.tokens} ⚡</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
