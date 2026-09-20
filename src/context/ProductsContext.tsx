import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { PRODUCTS } from '../data/products'
import { usePersistentState } from '../hooks/usePersistentState'
import { STORAGE_KEYS } from '../lib/storage'
import { applySales, recordSales, sanitizeSales, type Sales } from '../lib/stock'
import type { Product } from '../types'

interface ProductsContextValue {
  /** The catalog with stock already reduced by everything sold through checkout. */
  products: Product[]
  getProduct: (id: string) => Product | undefined
  /** Records units sold, lowering stock everywhere (cards, cart limits, product pages). */
  recordSale: (lines: { productId: string; quantity: number }[]) => void
}

const ProductsContext = createContext<ProductsContextValue | null>(null)
const NO_SALES: Sales = {}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = usePersistentState<Sales>(STORAGE_KEYS.sold, NO_SALES, sanitizeSales)

  const products = useMemo(() => applySales(PRODUCTS, sales), [sales])
  const getProduct = useCallback((id: string) => products.find((product) => product.id === id), [products])
  const recordSale = useCallback(
    (lines: { productId: string; quantity: number }[]) => setSales((current) => recordSales(current, lines)),
    [setSales],
  )

  const value = useMemo<ProductsContextValue>(() => ({ products, getProduct, recordSale }), [products, getProduct, recordSale])
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used inside <ProductsProvider>')
  return context
}
