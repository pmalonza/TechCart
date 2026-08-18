const ACCOUNTS_KEY = 'techcart:accounts'

export function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function findAccountByEmail(accounts, email) {
  const normalized = email.trim().toLowerCase()
  return accounts.find((account) => account.email.toLowerCase() === normalized) ?? null
}
