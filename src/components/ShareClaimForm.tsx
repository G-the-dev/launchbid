"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimShareReward } from "@/app/actions/tokens";
import { SHARE_X_TOKENS } from "@/lib/tokens";
import { input } from "@/lib/ui";

export default function ShareClaimForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const claim = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await claimShareReward(url);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={claim}>
      <label htmlFor="share-url" className="mb-1.5 block text-sm font-medium">
        Link to your post
      </label>
      <div className="flex gap-2">
        <input
          id="share-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/you/status/…"
          className={`${input} min-w-0 flex-1 text-sm`}
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-50 transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          {pending ? "Checking…" : `Claim ${SHARE_X_TOKENS} ⚡`}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
      )}
    </form>
  );
}
