import { describe, expect, it } from 'vitest'
import { DISCOUNT_CODES, calculateDiscount, findDiscountCode } from './discountCodes'

describe('findDiscountCode', () => {
  it('finds a code case-insensitively and trims whitespace', () => {
    expect(findDiscountCode('save10')).toEqual(DISCOUNT_CODES[0])
    expect(findDiscountCode('  SAVE10  ')).toEqual(DISCOUNT_CODES[0])
  })

  it('returns null for an unknown code', () => {
    expect(findDiscountCode('NOPE')).toBeNull()
  })

  it('has exactly two codes', () => {
    expect(DISCOUNT_CODES).toHaveLength(2)
  })
})

describe('calculateDiscount', () => {
  it('returns 0 with no discount applied', () => {
    expect(calculateDiscount(null, 100)).toBe(0)
  })

  it('calculates a percentage discount', () => {
    expect(calculateDiscount({ type: 'percent', value: 10 }, 200)).toBe(20)
  })

  it('calculates a flat discount', () => {
    expect(calculateDiscount({ type: 'flat', value: 5 }, 200)).toBe(5)
  })

  it('never discounts more than the subtotal', () => {
    expect(calculateDiscount({ type: 'flat', value: 50 }, 10)).toBe(10)
  })
})
