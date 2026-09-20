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

/**
 * Parses a typed dollar amount ("49", "49.5", "$1,299.99") into integer cents.
 * Returns null for anything that is not a plain amount with at most two decimals.
 * Works on the digits, never on floats, so 19.99 is exactly 1999.
 */
export function parsePriceToCents(text: string): number | null {
  const match = /^\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/.exec(text.trim())
  if (!match) return null
  const dollars = Number(match[1].replace(/,/g, ''))
  const cents = Number((match[2] ?? '').padEnd(2, '0'))
  const total = dollars * 100 + cents
  return Number.isSafeInteger(total) ? total : null
}
