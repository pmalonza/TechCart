import type { Address } from './addresses'
import { isShippingMethodId, type ShippingMethodId } from './checkout'
import type { CardBrand } from './payment'

export interface OrderLine {
  productId: string
  name: string
  brand: string
  /** Unit price at the time of purchase, so later price changes never rewrite history. */
  priceCents: number
  quantity: number
}

export type OrderPayment =
  | { method: 'card'; brand: CardBrand; last4: string }
  | { method: 'cod' }

/** The address an order was sent to: a copy, so editing the address book later does not change past orders. */
export type OrderAddress = Omit<Address, 'id' | 'isDefault'>

export interface Order {
  id: string
  /** Human-friendly reference shown to the customer, e.g. TC-20260920-4821. */
  number: string
  createdAt: string
  /** The account that placed the order, or null for a guest checkout. */
  userId: string | null
  email: string
  lines: OrderLine[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  shippingMethod: ShippingMethodId
  shippingAddress: OrderAddress
  payment: OrderPayment
  status: 'processing'
}

export function generateOrderNumber(now: Date, randomFourDigits: string): string {
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `TC-${date}-${randomFourDigits}`
}

/** Newest first. */
export function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function ordersForUser(orders: Order[], userId: string): Order[] {
  return sortOrders(orders.filter((order) => order.userId === userId))
}

/** Total number of items in an order (sum of quantities). */
export function orderItemCount(order: Pick<Order, 'lines'>): number {
  return order.lines.reduce((total, line) => total + line.quantity, 0)
}

/**
 * Whether `viewerId` may see an order: the account that placed it, or anyone
 * who holds the link to a guest order (its id is a random UUID).
 */
export function canViewOrder(order: Pick<Order, 'userId'>, viewerId: string | null): boolean {
  return order.userId === null || order.userId === viewerId
}

const isString = (value: unknown): value is string => typeof value === 'string'
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0

function sanitizeLine(raw: unknown): OrderLine | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { productId, name, brand, priceCents, quantity } = raw as Record<string, unknown>
  if (!isString(productId) || !isString(name) || !isString(brand) || !isCount(priceCents) || !isCount(quantity) || quantity === 0) return null
  return { productId, name, brand, priceCents, quantity }
}

function sanitizeAddress(raw: unknown): OrderAddress | null {
  if (typeof raw !== 'object' || raw === null) return null
  const record = raw as Record<string, unknown>
  const text = (key: string) => (isString(record[key]) ? (record[key] as string) : null)
  const fullName = text('fullName')
  const line1 = text('line1')
  const city = text('city')
  const postalCode = text('postalCode')
  const country = text('country')
  if (fullName === null || line1 === null || city === null || postalCode === null || country === null) return null
  return {
    label: text('label') ?? '',
    fullName,
    phone: text('phone') ?? '',
    line1,
    line2: text('line2') ?? '',
    city,
    region: text('region') ?? '',
    postalCode,
    country,
  }
}

function sanitizePayment(raw: unknown): OrderPayment | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { method, brand, last4 } = raw as Record<string, unknown>
  if (method === 'cod') return { method: 'cod' }
  if (method === 'card' && isString(brand) && isString(last4) && /^\d{4}$/.test(last4)) {
    const knownBrands: CardBrand[] = ['visa', 'mastercard', 'amex', 'discover', 'unknown']
    return { method: 'card', brand: knownBrands.includes(brand as CardBrand) ? (brand as CardBrand) : 'unknown', last4 }
  }
  return null
}

/** Turns untrusted stored data into valid orders, dropping anything malformed or duplicated. */
export function sanitizeOrders(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const orders: Order[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const record = item as Record<string, unknown>
    const { id, number, createdAt, userId, email, subtotalCents, shippingCents, taxCents, totalCents, shippingMethod } = record
    if (!isString(id) || seen.has(id) || !isString(number) || !isString(createdAt) || !isString(email)) continue
    if (userId !== null && !isString(userId)) continue
    if (![subtotalCents, shippingCents, taxCents, totalCents].every(isCount)) continue
    if (!isShippingMethodId(shippingMethod)) continue
    if (!Array.isArray(record.lines)) continue
    const lines = record.lines.map(sanitizeLine)
    if (lines.length === 0 || lines.some((line) => line === null)) continue
    const shippingAddress = sanitizeAddress(record.shippingAddress)
    const payment = sanitizePayment(record.payment)
    if (!shippingAddress || !payment) continue

    seen.add(id)
    orders.push({
      id,
      number,
      createdAt,
      userId: userId as string | null,
      email,
      lines: lines as OrderLine[],
      subtotalCents: subtotalCents as number,
      shippingCents: shippingCents as number,
      taxCents: taxCents as number,
      totalCents: totalCents as number,
      shippingMethod,
      shippingAddress,
      payment,
      status: 'processing',
    })
  }
  return orders
}
