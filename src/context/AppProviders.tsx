import type { ReactNode } from 'react'
import { AnnouncerProvider } from './AnnouncerContext'
import { CartProvider } from './CartContext'
import { ProductsProvider } from './ProductsContext'

/** Every app-wide context provider, in one place so tests and the app mount the same tree. */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AnnouncerProvider>
      <ProductsProvider>
        <CartProvider>{children}</CartProvider>
      </ProductsProvider>
    </AnnouncerProvider>
  )
}
