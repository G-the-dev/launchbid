"use client";

import { useState, useTransition } from "react";
import { createPurchase } from "@/app/actions/tokens";

type Pack = { inr: number; tokens: number; qr: string | null };

export default function BuyTokensForm({
  packs,
  vpa,
  defaultEmail,
}: {
  packs: Pack[];
  vpa: string;
  defaultEmail: string;
}) {
  const [selected, setSelected] = useState<Pack>(packs[1] ?? packs[0]);
  const [email, setEmail] = useState(defaultEmail);
  const [utr, setUtr] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPurchase({
        packInr: selected.inr,
        email,
        utr,
      });
      if (result.error) setError(result.error);
      else setStatus("sent");
    });
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-5 text-sm">
        <p className="font-semibold mb-1">Payment submitted ✓</p>
        <p>
          We&apos;re verifying your ₹{selected.inr} payment. Your{" "}
          {selected.tokens} tokens will appear in your balance shortly, and
          you&apos;ll get a confirmation at {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        {packs.map((pack) => (
          <button
            key={pack.inr}
            type="button"
            onClick={() => setSelected(pack)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              selected.inr === pack.inr
                ? "border-amber-500 bg-amber-500/10"
                : "border-black/15 dark:border-white/15 hover:border-amber-500"
            }`}
          >
            <div className="font-bold">₹{pack.inr}</div>
            <div className="text-sm opacity-70">{pack.tokens} tokens</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 text-center">
        {selected.qr ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.qr}
              alt={`UPI QR for ₹${selected.inr}`}
              width={200}
              height={200}
              className="mx-auto rounded-lg bg-white p-2"
            />
            <p className="text-sm mt-3">
              Scan to pay <b>₹{selected.inr}</b>
              {vpa && (
                <>
                  {" "}
                  or send to <span className="font-mono">{vpa}</span>
                </>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm opacity-70">
            UPI payments are being set up — check back shortly.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm">
          <span className="opacity-70">Your email (for confirmation + updates)</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-2.5 outline-none focus:border-amber-500"
          />
        </label>
        <label className="block text-sm">
          <span className="opacity-70">
            UPI transaction ID / UTR (shown in your payment app after paying)
          </span>
          <input
            type="text"
            required
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 421912345678"
            className="mt-1 w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-2.5 font-mono outline-none focus:border-amber-500"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending || !selected.qr}
        className="w-full rounded-xl bg-amber-500 text-black py-2.5 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
      >
        {pending ? "Submitting…" : `I've paid ₹${selected.inr} — credit ${selected.tokens} tokens`}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
