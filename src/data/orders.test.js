import { beforeEach, describe, expect, it } from 'vitest'
import { loadOrders, saveOrders } from './orders'

describe('order history storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when nothing is stored', () => {
    expect(loadOrders('ada@gmail.com')).toEqual([])
    expect(loadOrders(null)).toEqual([])
  })

  it('round-trips orders for a signed-in account', () => {
    const orders = [{ id: 'ORD-1', status: 'received' }]
    saveOrders('ada@gmail.com', orders)
    expect(loadOrders('ada@gmail.com')).toEqual(orders)
  })

  it('keeps the guest order history and an account history separate', () => {
    saveOrders(null, [{ id: 'ORD-1' }])
    saveOrders('ada@gmail.com', [{ id: 'ORD-2' }])

    expect(loadOrders(null)).toEqual([{ id: 'ORD-1' }])
    expect(loadOrders('ada@gmail.com')).toEqual([{ id: 'ORD-2' }])
  })

  it('is case-insensitive on the account email', () => {
    saveOrders('Ada@Gmail.com', [{ id: 'ORD-1' }])
    expect(loadOrders('ada@gmail.com')).toEqual([{ id: 'ORD-1' }])
  })
})
