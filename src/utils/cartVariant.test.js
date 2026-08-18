import { describe, expect, it } from 'vitest'
import { makeVariantId } from './cartVariant'

describe('makeVariantId', () => {
  it('combines product, color, and size into a stable id', () => {
    expect(makeVariantId('ref-1', 'white', null)).toBe('ref-1::white::')
  })

  it('produces different ids for different colors of the same product', () => {
    expect(makeVariantId('ref-1', 'white', null)).not.toBe(makeVariantId('ref-1', 'black', null))
  })

  it('produces different ids for different sizes of the same product and color', () => {
    expect(makeVariantId('phone-1', 'black', '128GB')).not.toBe(makeVariantId('phone-1', 'black', '256GB'))
  })
})
