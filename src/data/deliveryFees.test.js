import { describe, expect, it } from 'vitest'
import { FREE_SHIPPING_THRESHOLD, STANDARD_DELIVERY_FEE, calculateDeliveryFee } from './deliveryFees'

describe('calculateDeliveryFee', () => {
  it('charges the standard fee below the free-shipping threshold', () => {
    expect(calculateDeliveryFee(50)).toBe(STANDARD_DELIVERY_FEE)
  })

  it('is free at or above the free-shipping threshold', () => {
    expect(calculateDeliveryFee(FREE_SHIPPING_THRESHOLD)).toBe(0)
    expect(calculateDeliveryFee(FREE_SHIPPING_THRESHOLD + 1)).toBe(0)
  })

  it('is free for an empty cart', () => {
    expect(calculateDeliveryFee(0)).toBe(0)
  })
})
