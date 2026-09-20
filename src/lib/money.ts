const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** Formats an integer number of US cents as a dollar amount, e.g. 109900 -> "$1,099.00". */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100)
}

/** Whole-number percentage discount from `compareAtCents` down to `priceCents`. */
export function percentOff(priceCents: number, compareAtCents: number): number {
  if (compareAtCents <= 0 || priceCents >= compareAtCents) return 0
  return Math.round((1 - priceCents / compareAtCents) * 100)
}
