"use client";

import { useState } from "react";

type CardPack = { usd: number; tokens: number };

// One-click token refill, used on the homepage and in the token shop.
// Click a pack, land in the hosted card checkout, tokens credit automatically.
export default function QuickTopUp({
  packs,
  heading = "Quick refill",
  note,
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
      <section className="mc-panel p-5">
        <p className="text-sm text-mcgray">{emptyNote}</p>
      </section>
    ) : null;
  }

  return (
    <section className="mc-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-40">
          <h2 className="pixel-text text-base">{heading}</h2>
          {note && <p className="mt-0.5 text-sm text-pretty text-mcgray">{note}</p>}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
          {packs.map((pack) => (
            <button
              key={pack.usd}
              type="button"
              disabled={pending !== null}
              onClick={() => pay(pack.usd)}
              className="mc-btn flex-col px-4 py-2 text-sm"
            >
              <span className="tabular-nums">${pack.usd}</span>
              <span className="text-xs opacity-80 tabular-nums">
                {pack.tokens} ⚡
              </span>
            </button>
          ))}
        </div>
      </div>
      {pending !== null && (
        <p className="mt-3 text-sm text-mcgray">Opening secure checkout…</p>
      )}
      {error && (
        <p className="mt-3 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
      )}
    </section>
  );
}
