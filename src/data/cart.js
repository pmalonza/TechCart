const CART_KEY_PREFIX = 'techcart:cart:'
const GUEST_CART_KEY = `${CART_KEY_PREFIX}guest`

function cartKey(email) {
  return email ? `${CART_KEY_PREFIX}${email.trim().toLowerCase()}` : GUEST_CART_KEY
}

export function loadCart(email) {
  try {
    const raw = localStorage.getItem(cartKey(email))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(email, cart) {
  localStorage.setItem(cartKey(email), JSON.stringify(cart))
}
