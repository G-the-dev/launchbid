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
import { sfxLevelUp } from "@/lib/sound";

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
        window.dispatchEvent(new Event("lb:balance"));
        sfxLevelUp();
        setMessage({
          ok: true,
          text: `Bid landed. The board just re-ranked. You have ${formatTokens(result.balance ?? 0)} left.`,
        });
        router.refresh();
      }
    });
  };

  return (
    <section id="boost" className={`${card} p-6`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold">Boost this product</h2>
        <span className="text-sm tabular-nums text-mcgray">
          Your balance: {formatTokens(balance)}
        </span>
      </div>
      <p className="mt-1 text-sm text-pretty text-mcgray">
        Every token you bid adds to its lifetime total. That total is its rank.
      </p>

      <fieldset className="mt-5">
        <legend className="mb-1.5 block text-sm font-medium text-mcgray">
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
              className={`rounded-none border px-4 py-2.5 text-sm font-medium tabular-nums transition-colors ${
                !custom && selected === preset
                  ? "border-white bg-white/10 text-white"
                  : "border-mcdim hover:border-white"
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
            className="w-28 rounded-none border border-mcdim bg-transparent px-3.5 py-2.5 text-sm tabular-nums outline-none transition-colors placeholder:text-mcdim focus:border-white"
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
        <p className="mt-3 text-sm text-pretty text-mcgray">
          You need {formatTokens(amount - balance)} more.{" "}
          <Link href="/earn" className="font-medium text-white underline">
            Earn them free
          </Link>{" "}
          or{" "}
          <Link href="/tokens" className="font-medium text-white underline">
            buy a pack with UPI
          </Link>
          .
        </p>
      )}
      {message && (
        <p
          role="status"
          className={`mt-3 rounded-none px-4 py-2.5 text-sm ${
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
