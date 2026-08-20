export const MIN_BOOST_PAISE = 1_000; // Rs 10
export const MAX_BOOST_PAISE = 50_000_000; // Rs 5,00,000

export const BOOST_PRESETS_PAISE = [9_900, 49_900, 99_900]; // Rs 99 / 499 / 999

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
  }).format(rupees);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
