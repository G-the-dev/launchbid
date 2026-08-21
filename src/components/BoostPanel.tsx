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
          text: `Boost landed — the board just moved. Balance: ${formatTokens(result.balance ?? 0)}`,
        });
        router.refresh();
      }
    });
  };

  return (
    <section
      id="boost"
      className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 space-y-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">Boost this product</h2>
        <span className="text-sm opacity-70 tabular-nums">
          You have {formatTokens(balance)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {BOOST_PRESETS_TOKENS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setSelected(preset);
              setCustom("");
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              !custom && selected === preset
                ? "bg-amber-500 text-black border-amber-500"
                : "border-black/15 dark:border-white/15 hover:border-amber-500"
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
          placeholder="custom"
          className="w-24 rounded-full border border-black/15 dark:border-white/15 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-amber-500"
        />
      </div>

      <button
        type="button"
        onClick={boost}
        disabled={pending || !amountValid || !affordable}
        className="w-full rounded-xl bg-amber-500 text-black py-2.5 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
      >
        {pending
          ? "Boosting…"
          : amountValid
            ? `Boost ${formatTokens(amount)}`
            : `Minimum ${MIN_BOOST_TOKENS} tokens`}
      </button>

      {amountValid && !affordable && (
        <p className="text-sm">
          Not enough tokens —{" "}
          <Link href="/earn" className="underline font-medium">
            earn free tokens
          </Link>{" "}
          or{" "}
          <Link href="/tokens" className="underline font-medium">
            buy a pack via UPI
          </Link>
          .
        </p>
      )}
      {message && (
        <p
          className={`text-sm rounded-xl py-2.5 px-4 ${
            message.ok
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
