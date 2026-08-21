import { describe, expect, it } from 'vitest'
import { RETURN_POLICY, WARRANTY_INFO } from './policies'

describe.each([
  ['RETURN_POLICY', RETURN_POLICY],
  ['WARRANTY_INFO', WARRANTY_INFO],
])('%s', (_name, policy) => {
  it('has a title', () => {
    expect(policy.title.length).toBeGreaterThan(0)
  })

  it('has at least one section with a heading and body', () => {
    expect(policy.sections.length).toBeGreaterThan(0)
    for (const section of policy.sections) {
      expect(section.heading.length).toBeGreaterThan(0)
      expect(section.body.length).toBeGreaterThan(0)
    }
  })

  it('has no duplicate section headings', () => {
    const headings = policy.sections.map((section) => section.heading)
    expect(new Set(headings).size).toBe(headings.length)
  })
})
