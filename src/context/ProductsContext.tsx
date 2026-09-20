import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { PRODUCTS } from '../data/products'
import type { Product } from '../types'

interface ProductsContextValue {
  products: Product[]
  getProduct: (id: string) => Product | undefined
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ProductsContextValue>(
    () => ({
      products: PRODUCTS,
      getProduct: (id) => PRODUCTS.find((product) => product.id === id),
    }),
    [],
  )
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used inside <ProductsProvider>')
  return context
}
