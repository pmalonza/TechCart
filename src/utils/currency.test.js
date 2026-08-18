import { describe, expect, it } from 'vitest'
import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats a number as USD', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('always shows two decimal places', () => {
    expect(formatCurrency(9)).toBe('$9.00')
  })
})
