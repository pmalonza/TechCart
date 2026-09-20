import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { PRODUCTS } from '../data/products'
import { usePersistentState } from '../hooks/usePersistentState'
import { newId } from '../lib/auth'
import { ACCOUNT_DELETED_EVENT, type AccountDeletedDetail } from '../lib/events'
import { isSafeImageDataUrl } from '../lib/image'
import {
  MAX_LISTINGS_PER_USER,
  buildListing,
  canAddListing,
  sanitizeListings,
  validateListing,
  withListingImage,
  withoutListing,
  withoutSeller,
  type ListingInput,
} from '../lib/listings'
import { STORAGE_KEYS, writeJSON } from '../lib/storage'
import { applySales, recordSales, sanitizeSales, type Sales } from '../lib/stock'
import type { Product } from '../types'

export type ListingResult = { ok: true; product: Product } | { ok: false; error: string }

interface ProductsContextValue {
  /** The built-in catalog plus everyone's listings, with stock already reduced by what has been sold. */
  products: Product[]
  getProduct: (id: string) => Product | undefined
  /** Records units sold, lowering stock everywhere (cards, cart limits, product pages). */
  recordSale: (lines: { productId: string; quantity: number }[]) => void
  /** Publishes a product for `sellerId`. Fails if the input is invalid, the seller is at the limit, or storage is full. */
  addListing: (sellerId: string, input: ListingInput) => ListingResult
  /** Sets (or, with undefined, removes) the photo on one of `sellerId`'s own listings. */
  setListingImage: (id: string, sellerId: string, image: string | undefined) => ListingResult
  /** Deletes one of `sellerId`'s own listings. */
  removeListing: (id: string, sellerId: string) => void
}

const ProductsContext = createContext<ProductsContextValue | null>(null)
const NO_SALES: Sales = {}
const NO_LISTINGS: Product[] = []

const STORAGE_FULL = 'Your browser has no room left to save this. Remove a photo or another listing and try again.'

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = usePersistentState<Sales>(STORAGE_KEYS.sold, NO_SALES, sanitizeSales)
  const [listings, setListings] = usePersistentState<Product[]>(STORAGE_KEYS.listings, NO_LISTINGS, sanitizeListings)

  // A seller's listings go when their account does.
  useEffect(() => {
    function handleAccountDeleted(event: Event) {
      const { userId } = (event as CustomEvent<AccountDeletedDetail>).detail
      setListings((current) => withoutSeller(current, userId))
    }
    window.addEventListener(ACCOUNT_DELETED_EVENT, handleAccountDeleted)
    return () => window.removeEventListener(ACCOUNT_DELETED_EVENT, handleAccountDeleted)
  }, [setListings])

  const products = useMemo(() => applySales([...PRODUCTS, ...listings], sales), [listings, sales])
  const getProduct = useCallback((id: string) => products.find((product) => product.id === id), [products])
  const recordSale = useCallback(
    (lines: { productId: string; quantity: number }[]) => setSales((current) => recordSales(current, lines)),
    [setSales],
  )

  /** Saves the new list, unless the browser cannot store it; a photo that silently failed to save would vanish on reload. */
  const commit = useCallback(
    (next: Product[]): boolean => {
      if (!writeJSON(STORAGE_KEYS.listings, next)) return false
      setListings(next)
      return true
    },
    [setListings],
  )

  const addListing = useCallback<ProductsContextValue['addListing']>(
    (sellerId, input) => {
      if (Object.keys(validateListing(input)).length > 0) return { ok: false, error: 'Some of the details need fixing.' }
      if (!canAddListing(listings, sellerId)) return { ok: false, error: `You can list up to ${MAX_LISTINGS_PER_USER} products. Remove one to add another.` }
      if (input.image !== undefined && !isSafeImageDataUrl(input.image)) return { ok: false, error: 'That photo cannot be used. Choose another.' }
      const product = buildListing(input, sellerId, `listing-${newId()}`)
      if (!commit([...listings, product])) return { ok: false, error: STORAGE_FULL }
      return { ok: true, product }
    },
    [listings, commit],
  )

  const setListingImage = useCallback<ProductsContextValue['setListingImage']>(
    (id, sellerId, image) => {
      const existing = listings.find((listing) => listing.id === id && listing.sellerId === sellerId)
      if (!existing) return { ok: false, error: 'That listing could not be found.' }
      if (image !== undefined && !isSafeImageDataUrl(image)) return { ok: false, error: 'That photo cannot be used. Choose another.' }
      const next = withListingImage(listings, id, sellerId, image)
      if (!commit(next)) return { ok: false, error: STORAGE_FULL }
      return { ok: true, product: next.find((listing) => listing.id === id)! }
    },
    [listings, commit],
  )

  const removeListing = useCallback<ProductsContextValue['removeListing']>(
    (id, sellerId) => {
      commit(withoutListing(listings, id, sellerId))
    },
    [listings, commit],
  )

  const value = useMemo<ProductsContextValue>(
    () => ({ products, getProduct, recordSale, addListing, setListingImage, removeListing }),
    [products, getProduct, recordSale, addListing, setListingImage, removeListing],
  )
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used inside <ProductsProvider>')
  return context
}
