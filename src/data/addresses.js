const ADDRESSES_KEY_PREFIX = 'techcart:addresses:'
const GUEST_ADDRESSES_KEY = `${ADDRESSES_KEY_PREFIX}guest`

function addressesKey(email) {
  return email ? `${ADDRESSES_KEY_PREFIX}${email.trim().toLowerCase()}` : GUEST_ADDRESSES_KEY
}

export function loadAddresses(email) {
  try {
    const raw = localStorage.getItem(addressesKey(email))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAddresses(email, addresses) {
  localStorage.setItem(addressesKey(email), JSON.stringify(addresses))
}
