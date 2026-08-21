"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createProduct, getSiteMetadata } from "@/app/actions/products";
import type { SiteMetadata } from "@/lib/types";
import {
  LISTING_COST_TOKENS,
  SHARE_X_TOKENS,
  formatTokens,
} from "@/lib/tokens";
import { btnPrimary, btnSecondary, card, input, label } from "@/lib/ui";
import Favicon from "./Favicon";
import ShareClaimForm from "./ShareClaimForm";

function ShareGate() {
  const shareText = encodeURIComponent(
    `The top spots on LaunchBid are literally for sale. I'm bidding my product to #1. Outbid me: ${typeof window !== "undefined" ? window.location.origin : ""}`
  );
  return (
    <div className={`${card} border-gold/50 p-5`}>
      <h3 className="pixel-text text-base text-gold">
        Need tokens? Share once, earn {SHARE_X_TOKENS} ⚡ instantly
      </h3>
      <p className="mt-1 mb-4 text-sm text-pretty text-mcgray">
        Post about LaunchBid on X, paste the link to your post, and we verify
        it on the spot. That covers spawning ({LISTING_COST_TOKENS} ⚡) with{" "}
        {SHARE_X_TOKENS - LISTING_COST_TOKENS} ⚡ left for your first bids.
      </p>
      <a
        href={`https://twitter.com/intent/tweet?text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnSecondary} mb-3`}
      >
        Write the post ↗
      </a>
      <ShareClaimForm />
    </div>
  );
}

export default function SubmitForm({
  initialUrl = "",
  balance,
}: {
  initialUrl?: string;
  balance: number;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [meta, setMeta] = useState<SiteMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const autoRan = useRef(false);

  const affordable = balance >= LISTING_COST_TOKENS;

  const runLookup = (value: string) => {
    setError(null);
    startTransition(async () => {
      const result = await getSiteMetadata(value);
      if ("error" in result) setError(result.error);
      else setMeta(result);
    });
  };

  // Arriving from the homepage box: look the URL up immediately.
  useEffect(() => {
    if (initialUrl && !autoRan.current) {
      autoRan.current = true;
      runLookup(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const lookUp = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(url);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta) return;
    setError(null);
    startTransition(async () => {
      const result = await createProduct({
        url: meta.url,
        name: meta.name,
        tagline: meta.tagline,
        faviconUrl: meta.faviconUrl,
      });
      // On success createProduct redirects and never returns
      if (result?.error) {
        setError(
          result.error === "NOT_ENOUGH_TOKENS"
            ? `Spawning costs ${LISTING_COST_TOKENS} ⚡ and you have ${formatTokens(balance)}. Complete the share quest below to cover it.`
            : result.error
        );
      }
    });
  };

  if (!meta) {
    return (
      <div className="space-y-4">
        <form onSubmit={lookUp}>
          <label htmlFor="submit-url" className={label}>
            Your product&apos;s website
          </label>
          <input
            id="submit-url"
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourproduct.com"
            className={input}
            autoFocus
          />
          <button type="submit" disabled={pending} className={`${btnPrimary} mt-4 w-full`}>
            {pending ? "Mining your site…" : "Continue"}
          </button>
          {error && (
            <p className="mt-3 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}
        </form>
        {!affordable && <ShareGate />}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={`${card} flex items-center gap-3 px-4 py-3`}>
        <Favicon src={meta.faviconUrl} name={meta.name} size={40} />
        <span className="min-w-0 flex-1 truncate text-sm text-mcgray">
          {meta.url}
        </span>
        <button
          type="button"
          onClick={() => setMeta(null)}
          className="shrink-0 text-sm font-medium underline"
        >
          Change
        </button>
      </div>

      <div>
        <label htmlFor="submit-name" className={label}>
          Name
        </label>
        <input
          id="submit-name"
          type="text"
          required
          maxLength={80}
          value={meta.name}
          onChange={(e) => setMeta({ ...meta, name: e.target.value })}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="submit-tagline" className={label}>
          Tagline
        </label>
        <input
          id="submit-tagline"
          type="text"
          maxLength={140}
          value={meta.tagline}
          onChange={(e) => setMeta({ ...meta, tagline: e.target.value })}
          placeholder="One line on why it's great"
          className={input}
        />
        <p className="mt-1.5 text-sm text-mcgray">
          This is what the board shows under your name, so make it count.
        </p>
      </div>

      <div className={`${card} flex items-center justify-between px-4 py-3 text-sm`}>
        <span className="text-mcgray">Spawning cost</span>
        <span className="pixel-text tabular-nums">
          {formatTokens(LISTING_COST_TOKENS)}
          <span className="ml-2 text-mcdim">
            (you have {formatTokens(balance)})
          </span>
        </span>
      </div>

      <button
        type="submit"
        disabled={pending || !affordable}
        className={`${btnPrimary} w-full`}
      >
        {pending
          ? "Spawning…"
          : `Spawn it on the board (${formatTokens(LISTING_COST_TOKENS)})`}
      </button>
      {error && (
        <p className="bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
      )}
      {!affordable && <ShareGate />}
    </form>
  );
}
