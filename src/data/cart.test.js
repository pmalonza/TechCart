import { beforeEach, describe, expect, it } from 'vitest'
import { loadCart, saveCart } from './cart'

describe('cart storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when nothing is stored', () => {
    expect(loadCart('ada@gmail.com')).toEqual([])
    expect(loadCart(null)).toEqual([])
  })

  it('round-trips a cart for a signed-in account', () => {
    const items = [
      { variantId: 'ref-1::white::', productId: 'ref-1', colorId: 'white', size: null, quantity: 2 },
    ]
    saveCart('ada@gmail.com', items)
    expect(loadCart('ada@gmail.com')).toEqual(items)
  })

  it('keeps the guest cart and an account cart separate', () => {
    saveCart(null, [{ variantId: 'a', productId: 'a', colorId: null, size: null, quantity: 1 }])
    saveCart('ada@gmail.com', [{ variantId: 'b', productId: 'b', colorId: null, size: null, quantity: 3 }])

    expect(loadCart(null)).toHaveLength(1)
    expect(loadCart('ada@gmail.com')).toHaveLength(1)
    expect(loadCart(null)[0].productId).toBe('a')
    expect(loadCart('ada@gmail.com')[0].productId).toBe('b')
  })

  it('is case-insensitive on the account email', () => {
    saveCart('Ada@Gmail.com', [{ variantId: 'x', productId: 'x', colorId: null, size: null, quantity: 1 }])
    expect(loadCart('ada@gmail.com')).toHaveLength(1)
  })
})
