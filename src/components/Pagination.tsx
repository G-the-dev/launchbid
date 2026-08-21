import Link from "next/link";

export default function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1 && total <= pageSize) return null;

  // first, last, and a window around the current page
  const shown = new Set<number>([1, pages, page - 1, page, page + 1]);
  const items: (number | "gap")[] = [];
  let prev = 0;
  for (let n = 1; n <= pages; n++) {
    if (!shown.has(n)) continue;
    if (n - prev > 1) items.push("gap");
    items.push(n);
    prev = n;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn = "mc-btn size-9 text-sm tabular-nums";

  return (
    <nav aria-label="Leaderboard pages" className="mt-5 text-center">
      <div className="flex items-center justify-center gap-2">
        {page > 1 ? (
          <Link href={`/?page=${page - 1}`} aria-label="Previous page" className={btn}>
            &lt;
          </Link>
        ) : (
          <span className={`${btn} opacity-40`}>&lt;</span>
        )}
        {items.map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-mcdim">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={`/?page=${item}`}
              aria-current={item === page ? "page" : undefined}
              className={`${btn} ${item === page ? "mc-btn-grass" : ""}`}
            >
              {item}
            </Link>
          )
        )}
        {page < pages ? (
          <Link href={`/?page=${page + 1}`} aria-label="Next page" className={btn}>
            &gt;
          </Link>
        ) : (
          <span className={`${btn} opacity-40`}>&gt;</span>
        )}
      </div>
      <p className="mt-3 text-sm text-mcgray tabular-nums">
        {from} – {to} of {total}
      </p>
    </nav>
  );
}
