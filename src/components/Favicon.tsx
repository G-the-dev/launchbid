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
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#3a3a42] ring-1 ring-black"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="size-full scale-110 object-contain"
      />
    </span>
  );
}
