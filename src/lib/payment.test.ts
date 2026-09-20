import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  parseExpiry,
  summarizeCard,
  validateCard,
  type CardInput,
} from './payment'

const NOW = new Date(2026, 8, 20) // 20 September 2026

const validCard = (overrides: Partial<CardInput> = {}): CardInput => ({
  number: '4242 4242 4242 4242',
  name: 'Ada Lovelace',
  expiry: '12/28',
  cvc: '123',
  ...overrides,
})

describe('luhnValid', () => {
  it.each(['4242424242424242', '5555555555554444', '378282246310005', '6011111111111117', '4222222222222', '2223003122003222'])(
    'accepts the standard test number %s',
    (number) => {
      expect(luhnValid(number)).toBe(true)
    },
  )

  it('accepts spaces and hyphens as separators', () => {
    expect(luhnValid('4242 4242 4242 4242')).toBe(true)
    expect(luhnValid('4242-4242-4242-4242')).toBe(true)
  })

  it('catches a single mistyped digit', () => {
    expect(luhnValid('4242424242424241')).toBe(false)
    expect(luhnValid('4242424242424243')).toBe(false)
  })

  it('catches an adjacent transposition', () => {
    expect(luhnValid('4242424242424224')).toBe(false)
  })

  it('rejects empty and non-numeric input', () => {
    expect(luhnValid('')).toBe(false)
    expect(luhnValid('abcd efgh')).toBe(false)
    expect(luhnValid('4242 4242 4242 42a2')).toBe(false)
  })
})

describe('detectCardBrand', () => {
  it.each([
    ['4242424242424242', 'visa'],
    ['5555555555554444', 'mastercard'],
    ['5105105105105100', 'mastercard'],
    ['378282246310005', 'amex'],
    ['371449635398431', 'amex'],
    ['6011111111111117', 'discover'],
    ['6500000000000002', 'discover'],
    ['9999999999999995', 'unknown'],
    ['', 'unknown'],
  ])('%s is %s', (number, brand) => {
    expect(detectCardBrand(number)).toBe(brand)
  })

  it('recognises the whole Mastercard 2-series range and nothing just outside it', () => {
    for (const bin of ['2221', '2229', '2230', '2299', '2300', '2699', '2700', '2710', '2720']) {
      expect(detectCardBrand(`${bin}000000000000`), bin).toBe('mastercard')
    }
    for (const bin of ['2220', '2721', '2800']) {
      expect(detectCardBrand(`${bin}000000000000`), bin).toBe('unknown')
    }
  })
})

describe('formatting', () => {
  it('groups card numbers as 4-4-4-4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
    expect(formatCardNumber('42424')).toBe('4242 4')
    expect(formatCardNumber('4242-4242 abc')).toBe('4242 4242')
  })

  it('groups American Express as 4-6-5', () => {
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005')
  })

  it('caps the length at 19 digits', () => {
    expect(digitsIn(formatCardNumber('1'.repeat(30)))).toBe(19)
  })

  it('inserts the expiry slash automatically', () => {
    expect(formatExpiry('1')).toBe('1')
    expect(formatExpiry('12')).toBe('12')
    expect(formatExpiry('122')).toBe('12/2')
    expect(formatExpiry('1228')).toBe('12/28')
    expect(formatExpiry('12/28999')).toBe('12/28')
  })
})

const digitsIn = (text: string) => text.replace(/\D/g, '').length

describe('parseExpiry', () => {
  it('parses MM/YY into a month and four-digit year', () => {
    expect(parseExpiry('08/28')).toEqual({ month: 8, year: 2028 })
    expect(parseExpiry(' 12/30 ')).toEqual({ month: 12, year: 2030 })
  })

  it('rejects impossible or malformed dates', () => {
    for (const text of ['', '13/28', '00/28', '8/28', '0828', '08/2028', 'ab/cd']) {
      expect(parseExpiry(text), text).toBeNull()
    }
  })
})

describe('validateCard', () => {
  it('accepts a good card', () => {
    expect(validateCard(validCard(), NOW)).toEqual({})
  })

  it('requires every field', () => {
    expect(Object.keys(validateCard({ number: '', name: '', expiry: '', cvc: '' }, NOW)).sort()).toEqual(['cvc', 'expiry', 'name', 'number'])
  })

  it('rejects a number that fails the checksum', () => {
    expect(validateCard(validCard({ number: '4242 4242 4242 4241' }), NOW).number).toMatch(/does not look right/i)
  })

  it('rejects a number of the wrong length for its brand', () => {
    expect(validateCard(validCard({ number: '4242 4242 4242 42' }), NOW).number).toBeDefined() // 14-digit Visa
    expect(validateCard(validCard({ number: '3782 822463 10005', cvc: '1234' }), NOW)).toEqual({}) // 15-digit Amex is fine
  })

  it('treats a card as valid through the end of its expiry month', () => {
    expect(validateCard(validCard({ expiry: '09/26' }), NOW).expiry).toBeUndefined()
    expect(validateCard(validCard({ expiry: '08/26' }), NOW).expiry).toMatch(/expired/i)
    expect(validateCard(validCard({ expiry: '12/25' }), NOW).expiry).toMatch(/expired/i)
  })

  it('rejects a malformed or absurdly distant expiry', () => {
    expect(validateCard(validCard({ expiry: '1228' }), NOW).expiry).toMatch(/MM\/YY/)
    expect(validateCard(validCard({ expiry: '12/60' }), NOW).expiry).toMatch(/too far/i)
  })

  it('needs a 3-digit security code, or 4 for American Express', () => {
    expect(validateCard(validCard({ cvc: '12' }), NOW).cvc).toMatch(/3-digit/)
    expect(validateCard(validCard({ cvc: '1234' }), NOW).cvc).toMatch(/3-digit/)
    expect(validateCard(validCard({ cvc: 'abc' }), NOW).cvc).toBeDefined()
    expect(validateCard(validCard({ number: '378282246310005', cvc: '123' }), NOW).cvc).toMatch(/4-digit/)
  })
})

describe('summarizeCard', () => {
  it('keeps only the brand and the last four digits', () => {
    expect(summarizeCard('4242 4242 4242 4242')).toEqual({ brand: 'visa', last4: '4242' })
    expect(summarizeCard('3782 822463 10005')).toEqual({ brand: 'amex', last4: '0005' })
  })
})
