import { describe, expect, it } from 'vitest'
import { PAYMENT_METHODS, getPaymentMethodLabel } from './paymentMethods'

describe('getPaymentMethodLabel', () => {
  it('returns the label for a known payment method', () => {
    expect(getPaymentMethodLabel('paypal')).toBe('PayPal')
    expect(getPaymentMethodLabel('bank')).toBe('Bank transfer')
  })

  it('has a label for every method in the list', () => {
    for (const method of PAYMENT_METHODS) {
      expect(getPaymentMethodLabel(method.id)).toBe(method.label)
    }
  })
})
