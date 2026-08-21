"use client";

import { useState, useTransition } from "react";
import { createProduct, getSiteMetadata } from "@/app/actions/products";
import type { SiteMetadata } from "@/lib/types";
import { btnPrimary, card, input, label } from "@/lib/ui";
import Favicon from "./Favicon";

export default function SubmitForm() {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<SiteMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lookUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await getSiteMetadata(url);
      if ("error" in result) setError(result.error);
      else setMeta(result);
    });
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
      if (result?.error) setError(result.error);
    });
  };

  if (!meta) {
    return (
      <form onSubmit={lookUp}>
        <label htmlFor="submit-url" className={label}>
          Your product's website
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
          {pending ? "Reading your site…" : "Continue"}
        </button>
        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={`${card} flex items-center gap-3 px-4 py-3`}>
        <Favicon src={meta.faviconUrl} name={meta.name} size={40} />
        <span className="min-w-0 flex-1 truncate text-sm text-zinc-400">
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
        <p className="mt-1.5 text-sm text-zinc-400">
          This is what the board shows under your name — make it count.
        </p>
      </div>

      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Listing…" : "List it on the board"}
      </button>
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
