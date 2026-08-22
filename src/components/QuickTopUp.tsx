"use client";

import { useState } from "react";

type CardPack = { usd: number; tokens: number };

// One-line token refill, used on the homepage and in the token shop.
// Click a pack, land in the hosted card checkout, tokens credit automatically.
export default function QuickTopUp({
  packs,
  heading = "Quick refill",
  emptyNote,
}: {
  packs: CardPack[];
  heading?: string;
  emptyNote?: string;
}) {
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pay = async (usd: number) => {
    setError(null);
    setPending(usd);
    try {
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setPending(null);
    }
  };

  if (packs.length === 0) {
    return emptyNote ? (
      <p className="text-sm text-mcgray">{emptyNote}</p>
    ) : null;
  }

  return (
    <div className="w-fit max-w-full space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-sm text-mcgray">{heading}:</span>
        <div className="flex flex-wrap gap-1.5">
          {packs.map((pack) => (
            <button
              key={pack.usd}
              type="button"
              disabled={pending !== null}
              onClick={() => pay(pack.usd)}
              className="mc-btn px-2.5 py-1.5 text-xs whitespace-nowrap"
            >
              ${pack.usd}
              <span className="opacity-75 tabular-nums">· {pack.tokens} ⚡</span>
            </button>
          ))}
        </div>
      </div>
      {pending !== null && (
        <p className="text-xs text-mcgray">Opening secure checkout…</p>
      )}
      {error && (
        <p className="w-fit bg-red-500/10 px-3 py-1.5 text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}
