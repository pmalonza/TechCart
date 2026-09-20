import { formatPrice, parsePriceToCents, percentOff } from './money'

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

describe('parsePriceToCents', () => {
  it('parses whole and decimal amounts exactly', () => {
    expect(parsePriceToCents('49')).toBe(4900)
    expect(parsePriceToCents('49.5')).toBe(4950)
    expect(parsePriceToCents('19.99')).toBe(1999)
    expect(parsePriceToCents('0.05')).toBe(5)
  })

  it('accepts a dollar sign, spaces and thousands separators', () => {
    expect(parsePriceToCents('$1,299.99')).toBe(129999)
    expect(parsePriceToCents('  $ 20 ')).toBe(2000)
    expect(parsePriceToCents('1,000')).toBe(100000)
  })

  it('rejects anything that is not a plain amount', () => {
    for (const bad of ['', 'abc', '-5', '1.234', '1.', '.5', '1,00', '1,2345', '12e3', '1 000', '$', '1.2.3', '€5']) {
      expect(parsePriceToCents(bad), bad).toBeNull()
    }
  })

  it('rejects amounts too large to hold exactly', () => {
    expect(parsePriceToCents('99999999999999999999')).toBeNull()
  })
})
