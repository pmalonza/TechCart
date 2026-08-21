export const FREE_SHIPPING_THRESHOLD = 500
export const STANDARD_DELIVERY_FEE = 9.99

export function calculateDeliveryFee(subtotal) {
  if (subtotal <= 0) return 0
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE
}
