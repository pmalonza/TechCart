export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isAllowedEmailProvider(email) {
  const trimmed = email.trim()
  if (!EMAIL_PATTERN.test(trimmed)) return false
  const domain = trimmed.toLowerCase().split('@')[1]
  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}
