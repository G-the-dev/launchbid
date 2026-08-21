/* Favicons come from arbitrary external hosts, so next/image (which needs a
   remotePatterns allowlist) doesn't fit — a plain img with a letter fallback does. */
export default function Favicon({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string;
  size: number;
}) {
  if (!src) {
    return (
      <span
        aria-hidden
        className="flex shrink-0 items-center justify-center rounded-none bg-[#2a2a30] text-base font-semibold text-mcgray"
        style={{ width: size, height: size }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-none bg-white object-contain p-0.5 ring-1 ring-black"
    />
  );
}
