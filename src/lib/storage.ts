/** Storage keys, versioned so a future data-shape change can migrate instead of crashing on old data. */
export const STORAGE_KEYS = {
  cart: 'techcart.cart.v1',
  wishlist: 'techcart.wishlist.v1',
  users: 'techcart.users.v1',
  session: 'techcart.session.v1',
  resetTokens: 'techcart.resetTokens.v1',
  orders: 'techcart.orders.v1',
  sold: 'techcart.sold.v1',
  listings: 'techcart.listings.v1',
} as const

/** Reads and parses JSON from localStorage; returns `fallback` if it is missing, corrupt, or storage is unavailable. */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/** Writes JSON to localStorage; returns false if it could not be saved (private mode, quota exceeded, ...). */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function parseJSON(text: string | null): unknown {
  if (text === null) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}
