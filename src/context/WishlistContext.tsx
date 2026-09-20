import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { STORAGE_KEYS } from '../lib/storage'
import { sanitizeWishlist, toggleWishlist } from '../lib/wishlist'
import type { Product } from '../types'
import { useProducts } from './ProductsContext'

interface WishlistContextValue {
  /** Saved products that still exist in the catalog, newest first. */
  items: Product[]
  count: number
  has: (productId: string) => boolean
  toggle: (productId: string) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const EMPTY_WISHLIST: string[] = []

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useProducts()
  const [ids, setIds] = usePersistentState<string[]>(STORAGE_KEYS.wishlist, EMPTY_WISHLIST, sanitizeWishlist)

  const items = useMemo(
    () => ids.map((id) => getProduct(id)).filter((product): product is Product => product !== undefined),
    [ids, getProduct],
  )
  const has = useCallback((productId: string) => ids.includes(productId), [ids])
  const toggle = useCallback((productId: string) => setIds((current) => toggleWishlist(current, productId)), [setIds])
  const clear = useCallback(() => setIds(EMPTY_WISHLIST), [setIds])

  const value = useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, has, toggle, clear }),
    [items, has, toggle, clear],
  )
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return context
}
