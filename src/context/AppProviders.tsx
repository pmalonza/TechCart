import type { ReactNode } from 'react'
import { ProductsProvider } from './ProductsContext'

/** Every app-wide context provider, in one place so tests and the app mount the same tree. */
export default function AppProviders({ children }: { children: ReactNode }) {
  return <ProductsProvider>{children}</ProductsProvider>
}
