/**
 * Card-entry helpers for the demo checkout.
 *
 * No payment is ever processed and no card data is stored: the checkout keeps
 * only the brand and last four digits of what was entered, for the order
 * summary. These helpers exist so the form behaves like a real one -- format
 * as you type, catch typos with the Luhn check, reject expired cards.
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

export const CARD_BRAND_NAMES: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  unknown: 'Card',
}

export function digitsOnly(text: string): string {
  return text.replace(/\D/g, '')
}

/** The Luhn checksum, which catches nearly all single-digit typos and most transpositions. */
export function luhnValid(number: string): boolean {
  const digits = digitsOnly(number)
  if (digits.length === 0 || digits !== number.replace(/[\s-]/g, '')) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

export function detectCardBrand(number: string): CardBrand {
  const digits = digitsOnly(number)
  if (digits.startsWith('4')) return 'visa'
  // Mastercard BINs: 51-55, and the 2-series range 2221-2720.
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover'
  return 'unknown'
}

/** Groups a card number as it is typed: 4-4-4-4, or 4-6-5 for American Express. */
export function formatCardNumber(input: string): string {
  const digits = digitsOnly(input).slice(0, 19)
  if (detectCardBrand(digits) === 'amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ')
  }
  return (digits.match(/.{1,4}/g) ?? []).join(' ')
}

/** Formats an expiry as MM/YY while typing, inserting the slash automatically. */
export function formatExpiry(input: string): string {
  const digits = digitsOnly(input).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function parseExpiry(text: string): { month: number; year: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(text.trim())
  if (!match) return null
  const month = Number(match[1])
  if (month < 1 || month > 12) return null
  return { month, year: 2000 + Number(match[2]) }
}

export interface CardInput {
  number: string
  name: string
  expiry: string
  cvc: string
}

export type CardErrors = Partial<Record<keyof CardInput, string>>

function expectedLengths(brand: CardBrand): number[] {
  if (brand === 'amex') return [15]
  if (brand === 'visa') return [13, 16, 19]
  return [16]
}

/** Field-by-field problems with the entered card; an empty object means it looks valid. */
export function validateCard(input: CardInput, now: Date): CardErrors {
  const errors: CardErrors = {}

  const digits = digitsOnly(input.number)
  const brand = detectCardBrand(digits)
  if (!digits) errors.number = 'Enter your card number.'
  else if (!luhnValid(input.number) || !(brand === 'unknown' ? digits.length >= 12 && digits.length <= 19 : expectedLengths(brand).includes(digits.length))) {
    errors.number = 'That card number does not look right. Check it and try again.'
  }

  const name = input.name.trim()
  if (!name) errors.name = 'Enter the name on the card.'
  else if (name.length < 2 || name.length > 60) errors.name = 'Enter the name exactly as it appears on the card.'

  const expiry = parseExpiry(input.expiry)
  if (!input.expiry.trim()) errors.expiry = 'Enter the expiry date.'
  else if (!expiry) errors.expiry = 'Use the format MM/YY, like 08/28.'
  else {
    // A card is valid through the last day of its expiry month.
    const lastValidMonthIndex = expiry.year * 12 + expiry.month
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth() + 1
    if (lastValidMonthIndex < currentMonthIndex) errors.expiry = 'This card has expired.'
    else if (expiry.year > now.getFullYear() + 20) errors.expiry = 'That expiry date is too far in the future.'
  }

  const cvc = digitsOnly(input.cvc)
  const cvcLength = brand === 'amex' ? 4 : 3
  if (!input.cvc.trim()) errors.cvc = 'Enter the security code.'
  else if (cvc.length !== input.cvc.trim().length || cvc.length !== cvcLength) {
    errors.cvc = `Enter the ${cvcLength}-digit security code.`
  }

  return errors
}

/** What the order keeps about a card: only its brand and last four digits. */
export function summarizeCard(number: string): { brand: CardBrand; last4: string } {
  const digits = digitsOnly(number)
  return { brand: detectCardBrand(digits), last4: digits.slice(-4) }
}
