"use client";

import { useState } from "react";

type CardPack = { usd: number; tokens: number };

// One-line token refill, used on the homepage and in the token shop.
// Click a pack, land in the hosted card checkout, tokens credit automatically.
export default function QuickTopUp({
  packs,
  heading = "Quick refill",
  note = "Tokens land automatically after checkout.",
  emptyNote,
}: {
  packs: CardPack[];
  heading?: string;
  note?: string;
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
    <div
      className="mc-panel flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5"
      title={note}
    >
      <span className="pixel-text text-sm">{heading}</span>
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
      {pending !== null && (
        <span className="basis-full text-xs text-mcgray">Opening secure checkout…</span>
      )}
      {error && (
        <span className="basis-full bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
          {error}
        </span>
      )}
    </div>
  );
}
