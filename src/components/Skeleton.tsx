export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-zinc-800 px-4 py-4 last:border-b-0">
      <div className="size-8 shrink-0 animate-pulse rounded bg-zinc-800" />
      <div className="size-11 shrink-0 animate-pulse rounded-lg bg-zinc-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="h-3 w-64 animate-pulse rounded bg-zinc-800/70" />
      </div>
      <div className="h-8 w-20 shrink-0 animate-pulse rounded-lg bg-zinc-800" />
    </div>
  );
}

export function SkeletonBoard({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-900 ${className}`} />;
}
