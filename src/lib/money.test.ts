import { formatPrice, percentOff } from './money'

describe('formatPrice', () => {
  it('formats cents as US dollars with thousands separators', () => {
    expect(formatPrice(109900)).toBe('$1,099.00')
    expect(formatPrice(2900)).toBe('$29.00')
  })

  it('handles sub-dollar and zero amounts', () => {
    expect(formatPrice(5)).toBe('$0.05')
    expect(formatPrice(0)).toBe('$0.00')
  })
})

describe('percentOff', () => {
  it('rounds to a whole percentage', () => {
    expect(percentOff(189900, 209900)).toBe(10)
    expect(percentOff(29900, 34900)).toBe(14)
  })

  it('is zero when there is no discount', () => {
    expect(percentOff(1000, 1000)).toBe(0)
    expect(percentOff(1200, 1000)).toBe(0)
    expect(percentOff(1000, 0)).toBe(0)
  })
})
