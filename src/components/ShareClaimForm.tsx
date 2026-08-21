"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimShareReward } from "@/app/actions/tokens";

export default function ShareClaimForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const claim = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await claimShareReward(url);
      if (result.error) setMessage({ ok: false, text: result.error });
      else {
        setMessage({ ok: true, text: "Claimed! Tokens added to your balance." });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={claim} className="flex flex-wrap gap-2">
      <input
        type="url"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://x.com/you/status/…"
        className="flex-1 min-w-0 rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-amber-500 text-black text-sm font-semibold px-4 py-2 hover:bg-amber-400 disabled:opacity-50"
      >
        {pending ? "…" : "Claim"}
      </button>
      {message && (
        <p className={`basis-full text-sm ${message.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
