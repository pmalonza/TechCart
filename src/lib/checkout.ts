export type ShippingMethodId = 'standard' | 'express'

export interface ShippingMethod {
  id: ShippingMethodId
  name: string
  eta: string
  priceCents: number
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard', name: 'Standard delivery', eta: '5-7 business days', priceCents: 499 },
  { id: 'express', name: 'Express delivery', eta: '1-2 business days', priceCents: 1499 },
]

/** Standard delivery is free once the subtotal reaches this amount. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 10_000

/** Estimated sales tax, applied to the merchandise subtotal. */
export const TAX_RATE = 0.08

export function isShippingMethodId(value: unknown): value is ShippingMethodId {
  return SHIPPING_METHODS.some((method) => method.id === value)
}

export function getShippingMethod(id: ShippingMethodId): ShippingMethod {
  return SHIPPING_METHODS.find((method) => method.id === id)!
}

export function shippingCostCents(id: ShippingMethodId, subtotalCents: number): number {
  if (id === 'standard' && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0
  return getShippingMethod(id).priceCents
}

export function taxCents(subtotalCents: number): number {
  return Math.round(subtotalCents * TAX_RATE)
}

export interface Totals {
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
}

/** Everything is computed in integer cents, so totals are exact. */
export function computeTotals(subtotalCents: number, shippingMethod: ShippingMethodId): Totals {
  const shippingCents = shippingCostCents(shippingMethod, subtotalCents)
  const tax = taxCents(subtotalCents)
  return { subtotalCents, shippingCents, taxCents: tax, totalCents: subtotalCents + shippingCents + tax }
}

/** How much more the customer must spend to get free standard delivery (0 once they qualify). */
export function amountToFreeShipping(subtotalCents: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents)
}
