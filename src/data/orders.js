const ORDERS_KEY_PREFIX = 'techcart:orders:'
const GUEST_ORDERS_KEY = `${ORDERS_KEY_PREFIX}guest`

function ordersKey(email) {
  return email ? `${ORDERS_KEY_PREFIX}${email.trim().toLowerCase()}` : GUEST_ORDERS_KEY
}

export function loadOrders(email) {
  try {
    const raw = localStorage.getItem(ordersKey(email))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveOrders(email, orders) {
  localStorage.setItem(ordersKey(email), JSON.stringify(orders))
}
