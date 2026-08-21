// One source of truth for repeated component classes.
// Radius scale: panels rounded-xl, controls rounded-lg (children < parent).
// One accent (amber) per view: the primary action and the #1 rank only.

export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-400 disabled:pointer-events-none disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-stone-100 disabled:pointer-events-none disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/5";

export const btnQuiet =
  "text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100";

export const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 dark:border-white/15 dark:bg-white/5 dark:placeholder:text-stone-500";

export const label = "mb-1.5 block text-sm font-medium";

export const card =
  "rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-stone-900";

export const sectionTitle = "text-xl font-semibold text-balance";
