"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProduct, updateProduct } from "@/app/actions/products";
import type { Product } from "@/lib/types";
import { formatTokens } from "@/lib/tokens";
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
    if (!window.confirm(`Delete "${product.name}"? Its boost history goes with it.`))
      return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const inputClass =
    "w-full rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500";

  return (
    <li className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-3">
        <Favicon src={product.favicon_url} name={product.name} size={40} />
        <div className="min-w-0 flex-1">
          <Link href={`/p/${product.slug}`} className="font-semibold hover:underline">
            {product.name}
          </Link>
          <p className="text-sm opacity-70">
            #{rank} · {formatTokens(product.total_amount)} · {product.boost_count}{" "}
            boost{product.boost_count === 1 ? "" : "s"} · {product.click_count}{" "}
            click{product.click_count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <Link
            href={`/p/${product.slug}#boost`}
            className="rounded-full bg-amber-500 text-black font-medium px-3 py-1 hover:bg-amber-400 transition-colors"
          >
            Boost
          </Link>
          <button
            onClick={() => setEditing((v) => !v)}
            className="opacity-70 hover:opacity-100 underline"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={remove}
            disabled={pending}
            className="text-red-500 opacity-70 hover:opacity-100 underline disabled:opacity-30"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="mt-4 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            className={inputClass}
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={140}
            placeholder="Tagline"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-foreground text-background text-sm font-medium px-4 py-2 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </li>
  );
}
