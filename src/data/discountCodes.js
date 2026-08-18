export const DISCOUNT_CODES = [
  { code: 'SAVE10', type: 'percent', value: 10, label: '10% off your order' },
  { code: 'WELCOME5', type: 'flat', value: 5, label: '$5 off your order' },
]

export function findDiscountCode(code) {
  const normalized = code.trim().toUpperCase()
  return DISCOUNT_CODES.find((entry) => entry.code === normalized) ?? null
}

export function calculateDiscount(discount, subtotal) {
  if (!discount) return 0
  const amount = discount.type === 'percent' ? subtotal * (discount.value / 100) : discount.value
  return Math.min(amount, subtotal)
}
