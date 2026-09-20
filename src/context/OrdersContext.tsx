import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { newId } from '../lib/auth'
import { computeTotals, type ShippingMethodId } from '../lib/checkout'
import { ACCOUNT_DELETED_EVENT, type AccountDeletedDetail } from '../lib/events'
import { generateOrderNumber, sanitizeOrders, type Order, type OrderAddress, type OrderLine, type OrderPayment } from '../lib/orders'
import { STORAGE_KEYS } from '../lib/storage'
import { useProducts } from './ProductsContext'

export interface PlaceOrderInput {
  userId: string | null
  email: string
  lines: OrderLine[]
  shippingMethod: ShippingMethodId
  address: OrderAddress
  payment: OrderPayment
}

interface OrdersContextValue {
  orders: Order[]
  getOrder: (id: string) => Order | undefined
  /** Creates the order, records the sale (lowering stock) and returns the new order. */
  placeOrder: (input: PlaceOrderInput) => Order
}

const OrdersContext = createContext<OrdersContextValue | null>(null)
const NO_ORDERS: Order[] = []

function randomFourDigits(): string {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 10_000).padStart(4, '0')
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { recordSale } = useProducts()
  const [orders, setOrders] = usePersistentState<Order[]>(STORAGE_KEYS.orders, NO_ORDERS, sanitizeOrders)

  // An account's orders are personal data, so they go when the account does.
  useEffect(() => {
    function handleAccountDeleted(event: Event) {
      const { userId } = (event as CustomEvent<AccountDeletedDetail>).detail
      setOrders((current) => current.filter((order) => order.userId !== userId))
    }
    window.addEventListener(ACCOUNT_DELETED_EVENT, handleAccountDeleted)
    return () => window.removeEventListener(ACCOUNT_DELETED_EVENT, handleAccountDeleted)
  }, [setOrders])

  const getOrder = useCallback((id: string) => orders.find((order) => order.id === id), [orders])

  const placeOrder = useCallback(
    (input: PlaceOrderInput): Order => {
      const subtotalCents = input.lines.reduce((total, line) => total + line.priceCents * line.quantity, 0)
      const totals = computeTotals(subtotalCents, input.shippingMethod)
      const now = new Date()
      const order: Order = {
        id: newId(),
        number: generateOrderNumber(now, randomFourDigits()),
        createdAt: now.toISOString(),
        userId: input.userId,
        email: input.email,
        lines: input.lines,
        ...totals,
        shippingMethod: input.shippingMethod,
        shippingAddress: input.address,
        payment: input.payment,
        status: 'processing',
      }
      setOrders((current) => [order, ...current])
      recordSale(input.lines.map((line) => ({ productId: line.productId, quantity: line.quantity })))
      return order
    },
    [setOrders, recordSale],
  )

  const value = useMemo<OrdersContextValue>(() => ({ orders, getOrder, placeOrder }), [orders, getOrder, placeOrder])
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside <OrdersProvider>')
  return context
}
