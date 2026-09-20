import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_METHODS,
  amountToFreeShipping,
  computeTotals,
  getShippingMethod,
  isShippingMethodId,
  shippingCostCents,
  taxCents,
} from './checkout'

describe('shipping', () => {
  it('offers standard and express delivery', () => {
    expect(SHIPPING_METHODS.map((method) => method.id)).toEqual(['standard', 'express'])
    expect(getShippingMethod('express').priceCents).toBeGreaterThan(getShippingMethod('standard').priceCents)
  })

  it('charges for standard delivery below the free-shipping threshold', () => {
    expect(shippingCostCents('standard', 2900)).toBe(499)
    expect(shippingCostCents('standard', FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(499)
  })

  it('makes standard delivery free at and above the threshold', () => {
    expect(shippingCostCents('standard', FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0)
    expect(shippingCostCents('standard', 250000)).toBe(0)
  })

  it('always charges for express delivery', () => {
    expect(shippingCostCents('express', 250000)).toBe(1499)
  })

  it('recognises valid method ids only', () => {
    expect(isShippingMethodId('standard')).toBe(true)
    expect(isShippingMethodId('drone')).toBe(false)
    expect(isShippingMethodId(undefined)).toBe(false)
  })

  it('reports how far the cart is from free delivery', () => {
    expect(amountToFreeShipping(2500)).toBe(7500)
    expect(amountToFreeShipping(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0)
    expect(amountToFreeShipping(99999)).toBe(0)
  })
})

describe('tax and totals', () => {
  it('rounds tax to the nearest cent', () => {
    expect(taxCents(10000)).toBe(800)
    expect(taxCents(2900)).toBe(232)
    expect(taxCents(1999)).toBe(160) // 159.92 rounds up
    expect(taxCents(0)).toBe(0)
  })

  it('adds subtotal, shipping and tax exactly', () => {
    expect(computeTotals(2900, 'standard')).toEqual({ subtotalCents: 2900, shippingCents: 499, taxCents: 232, totalCents: 3631 })
  })

  it('has no shipping charge on a qualifying standard order', () => {
    expect(computeTotals(109900, 'standard')).toEqual({ subtotalCents: 109900, shippingCents: 0, taxCents: 8792, totalCents: 118692 })
  })

  it('adds the express charge on top', () => {
    expect(computeTotals(109900, 'express').totalCents).toBe(109900 + 1499 + 8792)
  })

  it('always equals the sum of its parts', () => {
    for (const subtotal of [0, 1, 99, 4900, 9999, 10000, 123457, 999999]) {
      for (const method of ['standard', 'express'] as const) {
        const totals = computeTotals(subtotal, method)
        expect(totals.totalCents).toBe(totals.subtotalCents + totals.shippingCents + totals.taxCents)
        expect(Number.isInteger(totals.totalCents)).toBe(true)
      }
    }
  })
})
