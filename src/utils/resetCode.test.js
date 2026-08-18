import { describe, expect, it } from 'vitest'
import { generateResetCode } from './resetCode'

describe('generateResetCode', () => {
  it('returns a 6-digit numeric string', () => {
    const code = generateResetCode()
    expect(code).toMatch(/^\d{6}$/)
  })

  it('produces different codes across calls (probabilistically)', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateResetCode()))
    expect(codes.size).toBeGreaterThan(1)
  })
})
