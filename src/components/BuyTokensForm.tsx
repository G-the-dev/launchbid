"use client";

import { useState, useTransition } from "react";
import { createPurchase } from "@/app/actions/tokens";
import { sfxLevelUp } from "@/lib/sound";
import { btnPrimary, card, input, label } from "@/lib/ui";

type Pack = { inr: number; tokens: number; qr: string | null };

// Active payment rail. Card (Dodo) is parked in QuickTopUp's CARD_ENABLED
// flag; flip both to swap rails.
const UPI_ENABLED = true;

function Step({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-base font-semibold">
      <span className="pixel-text text-gold">{n}.</span>
      {title}
    </h2>
  );
}

export default function BuyTokensForm({
  packs,
  vpa,
  defaultEmail,
  initialInr,
}: {
  packs: Pack[];
  vpa: string;
  defaultEmail: string;
  initialInr?: number;
}) {
  // --- UPI flow state (kept intact for when UPI_ENABLED returns) ---
  const [copiedVpa, setCopiedVpa] = useState(false);
  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 1600);
    } catch {
      /* clipboard unavailable: the text is still selectable */
    }
  };

  const [selected, setSelected] = useState<Pack>(
    packs.find((p) => p.inr === initialInr) ?? packs[1] ?? packs[0]
  );
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
      else {
        sfxLevelUp();
        setStatus("sent");
      }
    });
  };

  return (
    <div className="space-y-6">
      {UPI_ENABLED && status === "sent" && (
        <div className="rounded-none bg-emerald-500/10 p-6 text-emerald-300">
          <p className="text-base font-semibold">Payment submitted</p>
          <p className="mt-1 text-sm text-pretty">
            We're matching your ₹{selected.inr} payment now. Your{" "}
            {selected.tokens} tokens will appear in your balance shortly, and a
            confirmation goes to {email}.
          </p>
        </div>
      )}

      {UPI_ENABLED && status !== "sent" && (
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
                  className={`rounded-none border px-4 py-3 text-left transition-colors ${
                    selected.inr === pack.inr
                      ? "border-white bg-white/10"
                      : "border-mcdim hover:border-white"
                  }`}
                >
                  <span className="block text-base font-semibold tabular-nums">
                    ₹{pack.inr}
                  </span>
                  <span className="block text-sm tabular-nums text-mcgray">
                    {pack.tokens} tokens
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className={`${card} p-6`}>
            <Step n={2} title={`Pay ₹${selected.inr} with any UPI app`} />
            {selected.qr ? (
              <div className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.qr}
                  alt={`UPI QR code for ₹${selected.inr}`}
                  width={144}
                  height={144}
                  className="shrink-0 rounded-none bg-white p-2 ring-1 ring-black"
                />
                <div className="text-sm text-pretty text-mcgray">
                  <p>Scan with any UPI app: GPay, PhonePe, Paytm.</p>
                  {vpa && (
                    <p className="mt-2">
                      Or send directly to{" "}
                      <button
                        type="button"
                        onClick={copyVpa}
                        title="Copy UPI ID"
                        className="inline-flex items-center gap-1.5 font-mono font-medium text-white underline decoration-dotted underline-offset-4 hover:text-gold"
                      >
                        {vpa}
                        {copiedVpa ? (
                          <span className="text-xs text-emerald">Copied!</span>
                        ) : (
                          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="5.5" y="5.5" width="8" height="8" />
                            <path d="M10.5 5.5v-3h-8v8h3" />
                          </svg>
                        )}
                      </button>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-mcgray">
                UPI payments are being set up. Check back shortly.
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
              </div>
            </div>
          </section>

          <button type="submit" disabled={pending || !selected.qr} className={`${btnPrimary} w-full`}>
            {pending
              ? "Submitting…"
              : `I've paid ₹${selected.inr}, credit ${selected.tokens} tokens`}
          </button>
          {error && (
            <p className="bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
