import { PRODUCTS } from '../data/products'
import { applySales, recordSales, sanitizeSales } from './stock'

describe('sanitizeSales', () => {
  it('keeps positive integer counts', () => {
    expect(sanitizeSales({ a: 2, b: 10 })).toEqual({ a: 2, b: 10 })
  })

  it('rejects anything that is not a plain object', () => {
    expect(sanitizeSales(undefined)).toEqual({})
    expect(sanitizeSales(null)).toEqual({})
    expect(sanitizeSales([1, 2])).toEqual({})
    expect(sanitizeSales('x')).toEqual({})
  })

  it('drops zero, negative, fractional and non-numeric counts', () => {
    expect(sanitizeSales({ a: 0, b: -1, c: 1.5, d: '3', e: null, f: 4 })).toEqual({ f: 4 })
  })
})

describe('recordSales', () => {
  it('adds new products and accumulates existing ones', () => {
    const first = recordSales({}, [{ productId: 'a', quantity: 2 }])
    const second = recordSales(first, [{ productId: 'a', quantity: 1 }, { productId: 'b', quantity: 4 }])
    expect(second).toEqual({ a: 3, b: 4 })
  })

  it('ignores non-positive quantities and does not mutate its input', () => {
    const start = { a: 1 }
    expect(recordSales(start, [{ productId: 'a', quantity: 0 }, { productId: 'b', quantity: -3 }])).toEqual({ a: 1 })
    expect(start).toEqual({ a: 1 })
  })
})

describe('applySales', () => {
  const stockOf = (id: string) => PRODUCTS.find((p) => p.id === id)!.stock

  it('reduces stock by units sold', () => {
    const [adjusted] = applySales(PRODUCTS.filter((p) => p.id === 'nimbus-air-14'), { 'nimbus-air-14': 4 })
    expect(adjusted.stock).toBe(stockOf('nimbus-air-14') - 4)
  })

  it('never goes below zero', () => {
    const [adjusted] = applySales(PRODUCTS.filter((p) => p.id === 'voltix-strix-17'), { 'voltix-strix-17': 99 })
    expect(adjusted.stock).toBe(0)
  })

  it('leaves untouched products as the very same objects', () => {
    const adjusted = applySales(PRODUCTS, { 'nimbus-air-14': 1 })
    expect(adjusted.find((p) => p.id === 'pulse-s5')).toBe(PRODUCTS.find((p) => p.id === 'pulse-s5'))
  })
})
