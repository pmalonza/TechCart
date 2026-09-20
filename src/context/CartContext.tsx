import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import {
  addToCart,
  maxQuantity,
  removeFromCart,
  sanitizeCart,
  setLineQuantity,
  summarizeCart,
  type CartLine,
  type CartSummary,
} from '../lib/cart'
import { STORAGE_KEYS } from '../lib/storage'
import type { Product } from '../types'
import { useProducts } from './ProductsContext'

interface CartContextValue {
  summary: CartSummary
  itemCount: number
  /** Quantity of a product currently in the cart (0 if absent). */
  getQuantity: (productId: string) => number
  add: (product: Product, quantity?: number) => void
  setQuantity: (product: Product, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const EMPTY_CART: CartLine[] = []

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useProducts()
  const [lines, setLines] = usePersistentState<CartLine[]>(STORAGE_KEYS.cart, EMPTY_CART, sanitizeCart)

  const summary = useMemo(() => summarizeCart(lines, getProduct), [lines, getProduct])

  const getQuantity = useCallback(
    (productId: string) => summary.lines.find((line) => line.product.id === productId)?.quantity ?? 0,
    [summary],
  )
  const add = useCallback(
    (product: Product, quantity = 1) =>
      setLines((current) => addToCart(current, product.id, quantity, maxQuantity(product))),
    [setLines],
  )
  const setQuantity = useCallback(
    (product: Product, quantity: number) =>
      setLines((current) => setLineQuantity(current, product.id, quantity, maxQuantity(product))),
    [setLines],
  )
  const remove = useCallback((productId: string) => setLines((current) => removeFromCart(current, productId)), [setLines])
  const clear = useCallback(() => setLines(EMPTY_CART), [setLines])

  const value = useMemo<CartContextValue>(
    () => ({ summary, itemCount: summary.itemCount, getQuantity, add, setQuantity, remove, clear }),
    [summary, getQuantity, add, setQuantity, remove, clear],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
