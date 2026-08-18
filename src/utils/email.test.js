import { describe, expect, it } from 'vitest'
import { isAllowedEmailProvider } from './email'

describe('isAllowedEmailProvider', () => {
  it('accepts common real providers', () => {
    expect(isAllowedEmailProvider('ada@gmail.com')).toBe(true)
    expect(isAllowedEmailProvider('ada@outlook.com')).toBe(true)
    expect(isAllowedEmailProvider('ada@yahoo.com')).toBe(true)
  })

  it('is case-insensitive on the domain', () => {
    expect(isAllowedEmailProvider('ada@Gmail.COM')).toBe(true)
  })

  it('rejects an unrecognized domain', () => {
    expect(isAllowedEmailProvider('ada@made-up-domain.com')).toBe(false)
  })

  it('rejects a malformed email entirely', () => {
    expect(isAllowedEmailProvider('not-an-email')).toBe(false)
  })

  it('trims surrounding whitespace before checking', () => {
    expect(isAllowedEmailProvider('  ada@gmail.com  ')).toBe(true)
  })
})
