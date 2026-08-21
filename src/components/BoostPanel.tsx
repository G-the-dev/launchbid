"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { boostWithTokens } from "@/app/actions/tokens";
import {
  BOOST_PRESETS_TOKENS,
  MIN_BOOST_TOKENS,
  formatTokens,
} from "@/lib/tokens";
import { btnPrimary, card } from "@/lib/ui";

export default function BoostPanel({
  productId,
  balance,
}: {
  productId: string;
  balance: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number>(BOOST_PRESETS_TOKENS[0]);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const amount = custom ? Math.floor(Number(custom)) : selected;
  const amountValid = Number.isFinite(amount) && amount >= MIN_BOOST_TOKENS;
  const affordable = amountValid && amount <= balance;

  const boost = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await boostWithTokens(productId, amount);
      if (result.error) {
        setMessage({ ok: false, text: result.error });
      } else {
        setMessage({
          ok: true,
          text: `Bid landed — the board just re-ranked. You have ${formatTokens(result.balance ?? 0)} left.`,
        });
        router.refresh();
      }
    });
  };

  return (
    <section id="boost" className={`${card} p-6`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold">Boost this product</h2>
        <span className="text-sm tabular-nums text-zinc-400">
          Your balance: {formatTokens(balance)}
        </span>
      </div>
      <p className="mt-1 text-sm text-pretty text-zinc-400">
        Every token you bid adds to its lifetime total — that total is its rank.
      </p>

      <fieldset className="mt-5">
        <legend className="mb-1.5 block text-sm font-medium text-zinc-200">
          Amount
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          {BOOST_PRESETS_TOKENS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={!custom && selected === preset}
              onClick={() => {
                setSelected(preset);
                setCustom("");
              }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium tabular-nums transition-colors ${
                !custom && selected === preset
                  ? "border-amber-500 bg-amber-500/10 text-amber-300"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {formatTokens(preset)}
            </button>
          ))}
          <input
            type="number"
            min={MIN_BOOST_TOKENS}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Custom"
            aria-label="Custom token amount"
            className="w-28 rounded-lg border border-zinc-700 bg-transparent px-3.5 py-2.5 text-sm tabular-nums outline-none transition-colors placeholder:text-zinc-500 focus:border-amber-500"
          />
        </div>
      </fieldset>

      <button
        type="button"
        onClick={boost}
        disabled={pending || !amountValid || !affordable}
        className={`${btnPrimary} mt-4 w-full`}
      >
        {pending
          ? "Placing your bid…"
          : amountValid
            ? `Bid ${formatTokens(amount)}`
            : `Bids start at ${MIN_BOOST_TOKENS} tokens`}
      </button>

      {amountValid && !affordable && (
        <p className="mt-3 text-sm text-pretty text-zinc-300">
          You need {formatTokens(amount - balance)} more.{" "}
          <Link href="/earn" className="font-medium text-amber-400 underline">
            Earn them free
          </Link>{" "}
          or{" "}
          <Link href="/tokens" className="font-medium text-amber-400 underline">
            buy a pack with UPI
          </Link>
          .
        </p>
      )}
      {message && (
        <p
          role="status"
          className={`mt-3 rounded-lg px-4 py-2.5 text-sm ${
            message.ok
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-red-500/10 text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
