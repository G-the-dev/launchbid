"use client";

import { useState, useTransition } from "react";
import { createPurchase } from "@/app/actions/tokens";
import { btnPrimary, card, input, label } from "@/lib/ui";

type Pack = { inr: number; tokens: number; qr: string | null };

function Step({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-base font-semibold">
      <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-900">
        {n}
      </span>
      {title}
    </h2>
  );
}

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
      <div className="rounded-xl bg-emerald-500/10 p-6 text-emerald-300">
        <p className="text-base font-semibold">Payment submitted</p>
        <p className="mt-1 text-sm text-pretty">
          We're matching your ₹{selected.inr} payment now. Your{" "}
          {selected.tokens} tokens will appear in your balance shortly, and a
          confirmation goes to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className={`${card} p-6`}>
        <Step n={1} title="Pick a pack" />
        <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Token pack">
          {packs.map((pack) => (
            <button
              key={pack.inr}
              type="button"
              role="radio"
              aria-checked={selected.inr === pack.inr}
              onClick={() => setSelected(pack)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                selected.inr === pack.inr
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <span className="block text-base font-semibold tabular-nums">
                ₹{pack.inr}
              </span>
              <span className="block text-sm tabular-nums text-zinc-400">
                {pack.tokens} tokens
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={`${card} p-6`}>
        <Step n={2} title={`Pay ₹${selected.inr} with any UPI app`} />
        {selected.qr ? (
          <div className="mt-4 flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.qr}
              alt={`UPI QR code for ₹${selected.inr}`}
              width={144}
              height={144}
              className="shrink-0 rounded-lg bg-white p-2 ring-1 ring-zinc-300"
            />
            <div className="text-sm text-pretty text-zinc-400">
              <p>Scan with GPay, PhonePe, Paytm — any UPI app.</p>
              {vpa && (
                <p className="mt-2">
                  Or send directly to{" "}
                  <span className="font-mono font-medium text-zinc-100">
                    {vpa}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            UPI payments are being set up — check back shortly.
          </p>
        )}
      </section>

      <section className={`${card} p-6`}>
        <Step n={3} title="Confirm your payment" />
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="buy-email" className={label}>
              Email for confirmation
            </label>
            <input
              id="buy-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={input}
            />
            <p className="mt-1.5 text-sm text-zinc-400">
              We'll confirm your tokens here, plus occasional LaunchBid updates.
            </p>
          </div>
          <div>
            <label htmlFor="buy-utr" className={label}>
              UPI reference (UTR)
            </label>
            <input
              id="buy-utr"
              type="text"
              required
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. 421912345678"
              className={`${input} font-mono`}
            />
            <p className="mt-1.5 text-sm text-zinc-400">
              Shown in your UPI app right after paying — it's how we match your
              payment.
            </p>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending || !selected.qr}
        className={`${btnPrimary} w-full`}
      >
        {pending
          ? "Submitting…"
          : `I've paid ₹${selected.inr} — credit ${selected.tokens} tokens`}
      </button>
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
