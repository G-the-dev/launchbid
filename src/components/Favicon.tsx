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
        className="shrink-0 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold"
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
      className="shrink-0 rounded-lg object-contain bg-white"
    />
  );
}
