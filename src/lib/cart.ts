import type { Product } from '../types'

export interface CartLine {
  productId: string
  quantity: number
}

/** The most of one product a single order may contain, regardless of stock. */
export const MAX_PER_LINE = 10

/** The most of a product that can be in the cart: limited by stock and by MAX_PER_LINE. */
export function maxQuantity(product: Pick<Product, 'stock'>): number {
  return Math.max(0, Math.min(product.stock, MAX_PER_LINE))
}

/** Adds `quantity` of a product, merging with an existing line and never exceeding `max`. */
export function addToCart(lines: CartLine[], productId: string, quantity: number, max: number): CartLine[] {
  if (max <= 0 || quantity <= 0) return lines
  const existing = lines.find((line) => line.productId === productId)
  if (!existing) return [...lines, { productId, quantity: Math.min(quantity, max) }]
  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: Math.min(line.quantity + quantity, max) } : line,
  )
}

/** Sets a line's quantity (clamped to `max`); zero or less removes the line. Unknown products are ignored. */
export function setLineQuantity(lines: CartLine[], productId: string, quantity: number, max: number): CartLine[] {
  if (!lines.some((line) => line.productId === productId)) return lines
  if (quantity <= 0 || max <= 0) return removeFromCart(lines, productId)
  return lines.map((line) => (line.productId === productId ? { ...line, quantity: Math.min(quantity, max) } : line))
}

export function removeFromCart(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId)
}

/** Turns untrusted stored data into a valid cart: drops malformed, duplicate and non-positive lines. */
export function sanitizeCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const lines: CartLine[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { productId, quantity } = item as Record<string, unknown>
    if (typeof productId !== 'string' || seen.has(productId)) continue
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) continue
    seen.add(productId)
    lines.push({ productId, quantity: Math.min(quantity, MAX_PER_LINE) })
  }
  return lines
}

export interface DetailedLine {
  product: Product
  quantity: number
  lineTotalCents: number
  /** Set when the quantity had to be reduced because stock has dropped since it was added. */
  reducedFrom?: number
}

export interface CartSummary {
  lines: DetailedLine[]
  itemCount: number
  subtotalCents: number
  /** How much less than the original prices the subtotal is (sale discounts). */
  savingsCents: number
}

/**
 * Joins cart lines with product data. Products that no longer exist or are sold
 * out are dropped, and quantities are capped at what is currently available.
 */
export function summarizeCart(lines: CartLine[], getProduct: (id: string) => Product | undefined): CartSummary {
  const detailed: DetailedLine[] = []
  let itemCount = 0
  let subtotalCents = 0
  let savingsCents = 0

  for (const line of lines) {
    const product = getProduct(line.productId)
    if (!product) continue
    const max = maxQuantity(product)
    if (max <= 0) continue
    const quantity = Math.min(line.quantity, max)
    detailed.push({
      product,
      quantity,
      lineTotalCents: product.priceCents * quantity,
      reducedFrom: quantity < line.quantity ? line.quantity : undefined,
    })
    itemCount += quantity
    subtotalCents += product.priceCents * quantity
    if (product.compareAtCents !== undefined && product.compareAtCents > product.priceCents) {
      savingsCents += (product.compareAtCents - product.priceCents) * quantity
    }
  }

  return { lines: detailed, itemCount, subtotalCents, savingsCents }
}
