"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BOOST_PRESETS_PAISE,
  MAX_BOOST_PAISE,
  MIN_BOOST_PAISE,
  formatPaise,
  rupeesToPaise,
} from "@/lib/money";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (resp: unknown) => void) => void;
    };
  }
}

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Status = "idle" | "working" | "success" | "failed";

export default function BoostPanel({
  productId,
  productName,
  isSignedIn,
  loginHref,
}: {
  productId: string;
  productName: string;
  isSignedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number>(BOOST_PRESETS_PAISE[1]);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const amountPaise = custom ? rupeesToPaise(Number(custom)) : selected;
  const amountValid =
    Number.isFinite(amountPaise) &&
    amountPaise >= MIN_BOOST_PAISE &&
    amountPaise <= MAX_BOOST_PAISE;

  const boost = async () => {
    if (!isSignedIn) {
      router.push(loginHref);
      return;
    }
    setError(null);
    setStatus("working");

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, amount: amountPaise }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Could not start payment.");

      if (!(await loadCheckoutScript()) || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection.");
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        name: "LaunchBid",
        description: `Boost ${productName}`,
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            setStatus("success");
            router.refresh();
          } else {
            setStatus("failed");
            setError("Payment captured but not yet credited — it will appear shortly.");
          }
        },
      });
      rzp.on("payment.failed", () => {
        setStatus("failed");
        setError("Payment failed. No money was credited — try again.");
      });
      rzp.open();
    } catch (e) {
      setStatus("failed");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <section
      id="boost"
      className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 space-y-4"
    >
      <h2 className="font-semibold">Boost this product</h2>

      <div className="flex flex-wrap gap-2">
        {BOOST_PRESETS_PAISE.map((preset) => (
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
            {formatPaise(preset)}
          </button>
        ))}
        <div className="flex items-center gap-1 text-sm">
          <span className="opacity-70">₹</span>
          <input
            type="number"
            min={10}
            max={500000}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="custom"
            className="w-24 rounded-full border border-black/15 dark:border-white/15 bg-transparent px-3 py-1.5 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={boost}
        disabled={status === "working" || !amountValid}
        className="w-full rounded-xl bg-amber-500 text-black py-2.5 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
      >
        {status === "working"
          ? "Opening payment…"
          : isSignedIn
            ? `Boost ${amountValid ? formatPaise(amountPaise) : "—"}`
            : "Sign in to boost"}
      </button>

      {!amountValid && custom && (
        <p className="text-xs opacity-70">
          Boosts must be between ₹10 and ₹5,00,000.
        </p>
      )}
      {status === "success" && (
        <p className="text-sm rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-2.5 px-4">
          Boost landed — the leaderboard has been updated. 🎉
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </section>
  );
}
