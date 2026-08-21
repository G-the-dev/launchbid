"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProduct, updateProduct } from "@/app/actions/products";
import type { Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
import { btnQuiet, card, input, label } from "@/lib/ui";
import Favicon from "./Favicon";

export default function DashboardProductCard({
  product,
  rank,
}: {
  product: Product;
  rank: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [tagline, setTagline] = useState(product.tagline ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProduct(product.id, { name, tagline });
      if (result.error) setError(result.error);
      else {
        setEditing(false);
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!window.confirm(`Delete "${product.name}"? Its bid history goes with it.`))
      return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <li className={`${card} p-4`}>
      <div className="flex items-center gap-4">
        <Favicon src={product.favicon_url} name={product.name} size={40} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/p/${product.slug}`}
            className="text-base font-medium hover:underline"
          >
            {product.name}
          </Link>
          <p className="text-sm tabular-nums text-mcgray">
            #{rank} · {formatTokens(product.total_amount)} · {product.click_count}{" "}
            click{product.click_count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href={`/p/${product.slug}#boost`}
            className="mc-btn px-3 py-1.5 text-sm"
          >
            Boost
          </Link>
          <button onClick={() => setEditing((v) => !v)} className={btnQuiet}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={remove}
            disabled={pending}
            className="text-sm font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="mt-4 space-y-3 border-t border-black/70 pt-4">
          <div>
            <label htmlFor={`name-${product.id}`} className={label}>
              Name
            </label>
            <input
              id={`name-${product.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              className={`${input} text-sm`}
            />
          </div>
          <div>
            <label htmlFor={`tagline-${product.id}`} className={label}>
              Tagline
            </label>
            <input
              id={`tagline-${product.id}`}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={140}
              placeholder="One line on why it's great"
              className={`${input} text-sm`}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-none mc-btn px-4 py-2 text-sm"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
      {error && (
        <p className="mt-3 rounded-none bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </li>
  );
}
