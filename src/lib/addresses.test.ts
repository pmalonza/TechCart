import {
  COUNTRIES,
  MAX_ADDRESSES,
  addAddress,
  emptyAddressInput,
  formatAddressLines,
  getDefaultAddress,
  normalizeAddress,
  removeAddress,
  sanitizeAddresses,
  setDefaultAddress,
  updateAddress,
  validateAddress,
  type Address,
  type AddressInput,
} from './addresses'

const valid = (overrides: Partial<AddressInput> = {}): AddressInput => ({
  label: 'Home',
  fullName: 'Ada Lovelace',
  phone: '+254 700 000 000',
  line1: '12 Baker Street',
  line2: '',
  city: 'Nairobi',
  region: '',
  postalCode: '00100',
  country: 'KE',
  isDefault: false,
  ...overrides,
})

const stored = (id: string, isDefault = false, overrides: Partial<Address> = {}): Address => ({ id, ...valid(), isDefault, ...overrides })

describe('validateAddress', () => {
  it('accepts a complete address', () => {
    expect(validateAddress(valid())).toEqual({})
  })

  it('requires the essential fields', () => {
    const errors = validateAddress(emptyAddressInput('KE'))
    expect(Object.keys(errors).sort()).toEqual(['city', 'fullName', 'line1', 'phone', 'postalCode'])
  })

  it('treats whitespace-only fields as empty', () => {
    expect(validateAddress(valid({ fullName: '   ', city: '  ' }))).toMatchObject({
      fullName: expect.any(String),
      city: expect.any(String),
    })
  })

  it.each(['12345', '00000', '99999-1234'])('accepts the US ZIP code %s', (postalCode) => {
    expect(validateAddress(valid({ country: 'US', region: 'CA', postalCode })).postalCode).toBeUndefined()
  })

  it.each(['1234', 'ABCDE', '123456', '12345-12'])('rejects the US ZIP code %s', (postalCode) => {
    expect(validateAddress(valid({ country: 'US', region: 'CA', postalCode })).postalCode).toMatch(/like 94103/)
  })

  it('checks postal codes against each country’s own format', () => {
    expect(validateAddress(valid({ country: 'CA', region: 'ON', postalCode: 'K1A 0B1' })).postalCode).toBeUndefined()
    expect(validateAddress(valid({ country: 'CA', region: 'ON', postalCode: '12345' })).postalCode).toBeDefined()
    expect(validateAddress(valid({ country: 'GB', postalCode: 'SW1A 1AA' })).postalCode).toBeUndefined()
    expect(validateAddress(valid({ country: 'GB', postalCode: 'SW1A' })).postalCode).toBeDefined()
    expect(validateAddress(valid({ country: 'KE', postalCode: '0100' })).postalCode).toBeDefined()
    expect(validateAddress(valid({ country: 'IN', region: 'Delhi', postalCode: '110001' })).postalCode).toBeUndefined()
  })

  it('accepts any plausible code for countries without a strict format', () => {
    expect(validateAddress(valid({ country: 'GH', postalCode: 'GA-123-4567' })).postalCode).toBeUndefined()
    expect(validateAddress(valid({ country: 'GH', postalCode: '!!' })).postalCode).toBeDefined()
  })

  it('requires a region only where delivery needs one', () => {
    expect(validateAddress(valid({ country: 'US', region: '', postalCode: '94103' })).region).toBeDefined()
    expect(validateAddress(valid({ country: 'US', region: 'CA', postalCode: '94103' })).region).toBeUndefined()
    expect(validateAddress(valid({ country: 'KE', region: '' })).region).toBeUndefined()
  })

  it('validates phone numbers', () => {
    for (const phone of ['+254 700 000 000', '0700000000', '(415) 555-0132', '+1-415-555-0132']) {
      expect(validateAddress(valid({ phone })).phone).toBeUndefined()
    }
    for (const phone of ['12345', 'call me', '', '++123456789', '1'.repeat(25)]) {
      expect(validateAddress(valid({ phone })).phone).toBeDefined()
    }
  })

  it('rejects an unknown country and an over-long label', () => {
    expect(validateAddress(valid({ country: 'XX' })).country).toBeDefined()
    expect(validateAddress(valid({ label: 'x'.repeat(31) })).label).toBeDefined()
  })

  it('offers only countries that have a code, name and example postal code', () => {
    for (const country of COUNTRIES) {
      expect(country.code).toMatch(/^[A-Z]{2}$/)
      expect(country.name).not.toBe('')
      if (country.postalPattern) expect(country.postalPattern.test(country.postalExample)).toBe(true)
    }
    expect(new Set(COUNTRIES.map((country) => country.code)).size).toBe(COUNTRIES.length)
  })
})

describe('normalizeAddress', () => {
  it('trims text and upper-cases the postal code', () => {
    const normalized = normalizeAddress(valid({ fullName: '  Ada  ', postalCode: ' k1a 0b1 ', line2: ' Flat 2 ' }))
    expect(normalized.fullName).toBe('Ada')
    expect(normalized.postalCode).toBe('K1A 0B1')
    expect(normalized.line2).toBe('Flat 2')
  })
})

describe('addAddress', () => {
  it('makes the first address the default regardless of the flag', () => {
    const { addresses, address } = addAddress([], valid({ isDefault: false }), 'a')
    expect(address?.isDefault).toBe(true)
    expect(addresses).toHaveLength(1)
  })

  it('leaves the existing default alone for a normal addition', () => {
    const { addresses } = addAddress([stored('a', true)], valid({ isDefault: false }), 'b')
    expect(addresses.map((a) => [a.id, a.isDefault])).toEqual([['a', true], ['b', false]])
  })

  it('moves the default when the new address asks for it', () => {
    const { addresses } = addAddress([stored('a', true)], valid({ isDefault: true }), 'b')
    expect(addresses.map((a) => [a.id, a.isDefault])).toEqual([['a', false], ['b', true]])
  })

  it('refuses to exceed the limit', () => {
    const full = Array.from({ length: MAX_ADDRESSES }, (_, i) => stored(`a${i}`, i === 0))
    const result = addAddress(full, valid(), 'extra')
    expect(result.address).toBeNull()
    expect(result.addresses).toBe(full)
    expect(result.error).toMatch(/up to 10/)
  })
})

describe('updateAddress', () => {
  it('changes the details in place', () => {
    const { addresses, address } = updateAddress([stored('a', true)], 'a', valid({ city: 'Mombasa' }))
    expect(address?.city).toBe('Mombasa')
    expect(addresses[0].city).toBe('Mombasa')
  })

  it('cannot leave the book without a default', () => {
    const { addresses } = updateAddress([stored('a', true), stored('b')], 'a', valid({ isDefault: false }))
    expect(addresses.find((a) => a.id === 'a')?.isDefault).toBe(true)
  })

  it('can promote another address to default', () => {
    const { addresses } = updateAddress([stored('a', true), stored('b')], 'b', valid({ isDefault: true }))
    expect(addresses.map((a) => a.isDefault)).toEqual([false, true])
  })

  it('reports an address that does not exist', () => {
    const list = [stored('a', true)]
    const result = updateAddress(list, 'nope', valid())
    expect(result.address).toBeNull()
    expect(result.addresses).toBe(list)
    expect(result.error).toBeDefined()
  })
})

describe('removeAddress and setDefaultAddress', () => {
  it('removes an address', () => {
    expect(removeAddress([stored('a', true), stored('b')], 'b').map((a) => a.id)).toEqual(['a'])
  })

  it('promotes the first remaining address when the default is removed', () => {
    const result = removeAddress([stored('a', true), stored('b'), stored('c')], 'a')
    expect(result.map((a) => [a.id, a.isDefault])).toEqual([['b', true], ['c', false]])
  })

  it('handles removing the last address', () => {
    expect(removeAddress([stored('a', true)], 'a')).toEqual([])
  })

  it('sets exactly one default', () => {
    const result = setDefaultAddress([stored('a', true), stored('b'), stored('c')], 'c')
    expect(result.map((a) => a.isDefault)).toEqual([false, false, true])
  })

  it('ignores an unknown id', () => {
    const list = [stored('a', true)]
    expect(setDefaultAddress(list, 'nope')).toBe(list)
  })
})

describe('getDefaultAddress', () => {
  it('returns the default, else the first, else nothing', () => {
    expect(getDefaultAddress([stored('a'), stored('b', true)])?.id).toBe('b')
    expect(getDefaultAddress([stored('a'), stored('b')])?.id).toBe('a')
    expect(getDefaultAddress([])).toBeUndefined()
  })
})

describe('formatAddressLines', () => {
  it('lays out a full address', () => {
    expect(formatAddressLines(valid({ line2: 'Flat 2', region: 'Nairobi County' }))).toEqual([
      'Ada Lovelace',
      '12 Baker Street',
      'Flat 2',
      'Nairobi, Nairobi County 00100',
      'Kenya',
    ])
  })

  it('skips blank lines and falls back to the raw country code', () => {
    expect(formatAddressLines({ ...valid({ country: 'ZZ' }) })).toEqual(['Ada Lovelace', '12 Baker Street', 'Nairobi, 00100', 'ZZ'])
  })
})

describe('sanitizeAddresses', () => {
  it('keeps valid addresses', () => {
    expect(sanitizeAddresses([stored('a', true)])).toEqual([stored('a', true)])
  })

  it('rejects non-arrays and drops malformed or duplicate entries', () => {
    expect(sanitizeAddresses(undefined)).toEqual([])
    expect(sanitizeAddresses('x')).toEqual([])
    const result = sanitizeAddresses([stored('a', true), { id: 'b' }, null, 'junk', stored('a'), { ...stored('c'), city: 5 }])
    expect(result.map((a) => a.id)).toEqual(['a'])
  })

  it('always leaves exactly one default', () => {
    expect(sanitizeAddresses([stored('a'), stored('b')]).map((a) => a.isDefault)).toEqual([true, false])
    expect(sanitizeAddresses([stored('a', true), stored('b', true)]).map((a) => a.isDefault)).toEqual([true, false])
    expect(sanitizeAddresses([stored('a'), stored('b', true)]).map((a) => a.isDefault)).toEqual([false, true])
  })

  it('fills in optional fields and caps the number of addresses', () => {
    const minimal = { id: 'a', fullName: 'A B', line1: 'x y z', city: 'City', postalCode: '1234', country: 'ZA' }
    expect(sanitizeAddresses([minimal])[0]).toMatchObject({ label: '', phone: '', line2: '', region: '', isDefault: true })
    const many = Array.from({ length: MAX_ADDRESSES + 5 }, (_, i) => stored(`a${i}`))
    expect(sanitizeAddresses(many)).toHaveLength(MAX_ADDRESSES)
  })
})
