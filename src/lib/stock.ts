import type { Product } from '../types'

/** Units sold through this browser's checkout, per product id. */
export type Sales = Record<string, number>

/** Turns untrusted stored data into a valid sales ledger: string keys with positive integer counts. */
export function sanitizeSales(raw: unknown): Sales {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}
  const sales: Sales = {}
  for (const [productId, count] of Object.entries(raw)) {
    if (typeof count === 'number' && Number.isInteger(count) && count > 0) sales[productId] = count
  }
  return sales
}

/** Adds an order's lines to the ledger. */
export function recordSales(sales: Sales, lines: { productId: string; quantity: number }[]): Sales {
  const next = { ...sales }
  for (const { productId, quantity } of lines) {
    if (quantity > 0) next[productId] = (next[productId] ?? 0) + quantity
  }
  return next
}

/** Returns the products with stock reduced by what has been sold; stock never goes below zero. */
export function applySales(products: Product[], sales: Sales): Product[] {
  return products.map((product) => {
    const sold = sales[product.id]
    return sold ? { ...product, stock: Math.max(0, product.stock - sold) } : product
  })
}
