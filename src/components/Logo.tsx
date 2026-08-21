// LaunchBid mark: three ascending bars, a leaderboard being climbed.
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0"
    >
      <rect width="64" height="64" rx="14" fill="#fafafa" />
      <rect x="14" y="36" width="9" height="14" rx="2" fill="#09090b" />
      <rect x="27.5" y="26" width="9" height="24" rx="2" fill="#09090b" />
      <rect x="41" y="14" width="9" height="36" rx="2" fill="#09090b" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-lg font-semibold">
        Launch<span className="text-zinc-400">Bid</span>
      </span>
    </span>
  );
}
