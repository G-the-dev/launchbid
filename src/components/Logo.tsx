// LaunchBid mark: a grass block, pixel by pixel.
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden
      className="pixelated shrink-0"
      shapeRendering="crispEdges"
    >
      <rect width="16" height="16" fill="#79553a" />
      <rect x="2" y="7" width="2" height="2" fill="#5e4127" />
      <rect x="7" y="10" width="2" height="2" fill="#5e4127" />
      <rect x="12" y="8" width="2" height="2" fill="#8a6142" />
      <rect x="4" y="13" width="2" height="2" fill="#8a6142" />
      <rect width="16" height="5" fill="#5bba3a" />
      <rect x="0" y="4" width="2" height="2" fill="#5bba3a" />
      <rect x="6" y="4" width="3" height="2" fill="#5bba3a" />
      <rect x="12" y="4" width="2" height="2" fill="#5bba3a" />
      <rect x="2" y="1" width="2" height="2" fill="#4a9e2d" />
      <rect x="9" y="2" width="3" height="1" fill="#4a9e2d" />
      <rect x="13" y="0" width="2" height="2" fill="#6fd14b" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      {/* The Minecraft font carries extra descent space; nudge to optical center */}
      <span className="pixel-text text-lg leading-none translate-y-[2px]">
        Launch<span className="text-gold">Bid</span>
      </span>
    </span>
  );
}
