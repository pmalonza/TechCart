export const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal' },
  { id: 'bank', label: 'Bank transfer' },
]

export function getPaymentMethodLabel(id) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id
}
