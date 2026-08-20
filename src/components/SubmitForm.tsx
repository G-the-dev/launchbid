"use client";

import { useState, useTransition } from "react";
import { createProduct, getSiteMetadata } from "@/app/actions/products";
import type { SiteMetadata } from "@/lib/types";
import Favicon from "./Favicon";

export default function SubmitForm() {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<SiteMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "w-full rounded-xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-2.5 outline-none focus:border-amber-500";

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
      <form onSubmit={lookUp} className="space-y-4">
        <input
          type="text"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourproduct.com"
          className={inputClass}
          autoFocus
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-amber-500 text-black py-2.5 font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {pending ? "Fetching your site…" : "Continue"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3">
        <Favicon src={meta.faviconUrl} name={meta.name} size={40} />
        <span className="text-sm opacity-70 truncate">{meta.url}</span>
        <button
          type="button"
          onClick={() => setMeta(null)}
          className="ml-auto text-xs underline opacity-70 hover:opacity-100"
        >
          Change
        </button>
      </div>

      <label className="block text-sm">
        <span className="opacity-70">Name</span>
        <input
          type="text"
          required
          maxLength={80}
          value={meta.name}
          onChange={(e) => setMeta({ ...meta, name: e.target.value })}
          className={`${inputClass} mt-1`}
        />
      </label>

      <label className="block text-sm">
        <span className="opacity-70">Tagline</span>
        <input
          type="text"
          maxLength={140}
          value={meta.tagline}
          onChange={(e) => setMeta({ ...meta, tagline: e.target.value })}
          placeholder="One line on why it's great"
          className={`${inputClass} mt-1`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-amber-500 text-black py-2.5 font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
      >
        {pending ? "Listing…" : "List it on LaunchBid"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
