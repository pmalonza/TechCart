const WISHLIST_KEY_PREFIX = 'techcart:wishlist:'
const GUEST_WISHLIST_KEY = `${WISHLIST_KEY_PREFIX}guest`

function wishlistKey(email) {
  return email ? `${WISHLIST_KEY_PREFIX}${email.trim().toLowerCase()}` : GUEST_WISHLIST_KEY
}

export function loadWishlist(email) {
  try {
    const raw = localStorage.getItem(wishlistKey(email))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveWishlist(email, productIds) {
  localStorage.setItem(wishlistKey(email), JSON.stringify(productIds))
}
