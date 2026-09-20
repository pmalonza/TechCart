import type { ReactNode } from 'react'
import { AnnouncerProvider } from './AnnouncerContext'
import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { OrdersProvider } from './OrdersContext'
import { ProductsProvider } from './ProductsContext'
import { WishlistProvider } from './WishlistContext'

/** Every app-wide context provider, in one place so tests and the app mount the same tree. */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AnnouncerProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <WishlistProvider>
              <OrdersProvider>{children}</OrdersProvider>
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </AnnouncerProvider>
  )
}
