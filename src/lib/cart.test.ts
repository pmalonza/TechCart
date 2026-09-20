import { PRODUCTS } from '../data/products'
import {
  MAX_PER_LINE,
  addToCart,
  maxQuantity,
  removeFromCart,
  sanitizeCart,
  setLineQuantity,
  summarizeCart,
  type CartLine,
} from './cart'

const byId = (id: string) => PRODUCTS.find((product) => product.id === id)

describe('maxQuantity', () => {
  it('is limited by stock, then by the per-line cap', () => {
    expect(maxQuantity({ stock: 3 })).toBe(3)
    expect(maxQuantity({ stock: 200 })).toBe(MAX_PER_LINE)
    expect(maxQuantity({ stock: 0 })).toBe(0)
    expect(maxQuantity({ stock: -4 })).toBe(0)
  })
})

describe('addToCart', () => {
  it('adds a new line', () => {
    expect(addToCart([], 'a', 2, 5)).toEqual([{ productId: 'a', quantity: 2 }])
  })

  it('merges into an existing line without adding a second one', () => {
    const lines: CartLine[] = [{ productId: 'a', quantity: 1 }]
    expect(addToCart(lines, 'a', 2, 5)).toEqual([{ productId: 'a', quantity: 3 }])
  })

  it('never exceeds the maximum', () => {
    expect(addToCart([], 'a', 9, 3)).toEqual([{ productId: 'a', quantity: 3 }])
    expect(addToCart([{ productId: 'a', quantity: 2 }], 'a', 5, 3)).toEqual([{ productId: 'a', quantity: 3 }])
  })

  it('ignores a product that cannot be bought or a non-positive quantity', () => {
    const lines: CartLine[] = [{ productId: 'a', quantity: 1 }]
    expect(addToCart(lines, 'b', 1, 0)).toBe(lines)
    expect(addToCart(lines, 'b', 0, 5)).toBe(lines)
    expect(addToCart(lines, 'b', -2, 5)).toBe(lines)
  })

  it('does not mutate its input', () => {
    const lines: CartLine[] = [{ productId: 'a', quantity: 1 }]
    addToCart(lines, 'a', 1, 5)
    expect(lines).toEqual([{ productId: 'a', quantity: 1 }])
  })
})

describe('setLineQuantity and removeFromCart', () => {
  const lines: CartLine[] = [
    { productId: 'a', quantity: 2 },
    { productId: 'b', quantity: 1 },
  ]

  it('sets a quantity, clamped to the maximum', () => {
    expect(setLineQuantity(lines, 'a', 4, 5)[0].quantity).toBe(4)
    expect(setLineQuantity(lines, 'a', 99, 5)[0].quantity).toBe(5)
  })

  it('removes the line when the quantity is zero or less', () => {
    expect(setLineQuantity(lines, 'a', 0, 5)).toEqual([{ productId: 'b', quantity: 1 }])
    expect(setLineQuantity(lines, 'a', -1, 5)).toEqual([{ productId: 'b', quantity: 1 }])
  })

  it('ignores products that are not in the cart', () => {
    expect(setLineQuantity(lines, 'zzz', 3, 5)).toBe(lines)
  })

  it('removes a line by id', () => {
    expect(removeFromCart(lines, 'a')).toEqual([{ productId: 'b', quantity: 1 }])
    expect(removeFromCart(lines, 'zzz')).toEqual(lines)
  })
})

describe('sanitizeCart', () => {
  it('keeps valid lines', () => {
    expect(sanitizeCart([{ productId: 'a', quantity: 2 }])).toEqual([{ productId: 'a', quantity: 2 }])
  })

  it('rejects anything that is not an array', () => {
    expect(sanitizeCart(undefined)).toEqual([])
    expect(sanitizeCart(null)).toEqual([])
    expect(sanitizeCart({ productId: 'a', quantity: 1 })).toEqual([])
    expect(sanitizeCart('cart')).toEqual([])
  })

  it('drops malformed, duplicate and non-positive lines and caps oversized quantities', () => {
    const raw = [
      { productId: 'a', quantity: 2 },
      { productId: 'a', quantity: 5 },
      { productId: 'b', quantity: 0 },
      { productId: 'c', quantity: -1 },
      { productId: 'd', quantity: 1.5 },
      { productId: 42, quantity: 1 },
      { productId: 'e' },
      'junk',
      null,
      { productId: 'f', quantity: 9999 },
    ]
    expect(sanitizeCart(raw)).toEqual([
      { productId: 'a', quantity: 2 },
      { productId: 'f', quantity: MAX_PER_LINE },
    ])
  })
})

describe('summarizeCart', () => {
  it('totals items and the subtotal in integer cents', () => {
    const summary = summarizeCart(
      [
        { productId: 'nimbus-air-14', quantity: 1 },
        { productId: 'lumen-usbc-hub', quantity: 3 },
      ],
      byId,
    )
    expect(summary.itemCount).toBe(4)
    expect(summary.subtotalCents).toBe(109900 + 3 * 4900)
    expect(summary.lines.map((line) => line.lineTotalCents)).toEqual([109900, 14700])
    expect(summary.savingsCents).toBe(0)
  })

  it('counts sale discounts as savings', () => {
    const summary = summarizeCart([{ productId: 'nimbus-pro-16', quantity: 2 }], byId)
    expect(summary.subtotalCents).toBe(2 * 189900)
    expect(summary.savingsCents).toBe(2 * (209900 - 189900))
  })

  it('drops unknown and sold-out products', () => {
    const summary = summarizeCart(
      [
        { productId: 'deleted-product', quantity: 1 },
        { productId: 'orbit-fold', quantity: 1 },
        { productId: 'pulse-s5', quantity: 1 },
      ],
      byId,
    )
    expect(summary.lines.map((line) => line.product.id)).toEqual(['pulse-s5'])
  })

  it('caps a quantity at current stock and reports the reduction', () => {
    // Voltix Strix 17 has only 3 in stock.
    const summary = summarizeCart([{ productId: 'voltix-strix-17', quantity: 8 }], byId)
    expect(summary.lines[0].quantity).toBe(3)
    expect(summary.lines[0].reducedFrom).toBe(8)
    expect(summary.itemCount).toBe(3)
    expect(summary.subtotalCents).toBe(3 * 159900)
  })

  it('handles an empty cart', () => {
    expect(summarizeCart([], byId)).toEqual({ lines: [], itemCount: 0, subtotalCents: 0, savingsCents: 0 })
  })
})
