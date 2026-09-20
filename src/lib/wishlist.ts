/** Adds `productId` to the front of the list (newest first), or removes it if already present. */
export function toggleWishlist(ids: string[], productId: string): string[] {
  return ids.includes(productId) ? ids.filter((id) => id !== productId) : [productId, ...ids]
}

/** Turns untrusted stored data into a valid wishlist: an array of unique, non-empty strings. */
export function sanitizeWishlist(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const ids: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string' || item === '' || seen.has(item)) continue
    seen.add(item)
    ids.push(item)
  }
  return ids
}
