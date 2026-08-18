import { describe, expect, it } from 'vitest'
import { hashPassword } from './hash'

describe('hashPassword', () => {
  it('produces a consistent hex digest for the same input', async () => {
    const a = await hashPassword('correct-horse-battery-staple')
    const b = await hashPassword('correct-horse-battery-staple')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces different digests for different input', async () => {
    const a = await hashPassword('password-one')
    const b = await hashPassword('password-two')
    expect(a).not.toBe(b)
  })

  it('never returns the plaintext password', async () => {
    const hash = await hashPassword('hunter2')
    expect(hash).not.toContain('hunter2')
  })
})
