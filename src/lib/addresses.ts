export const MAX_ADDRESSES = 10

export interface Country {
  code: string
  name: string
  /** Whether a state/province/county is needed to deliver there. */
  regionRequired: boolean
  /** Pattern a postal code must match, or null when any plausible code is accepted. */
  postalPattern: RegExp | null
  postalExample: string
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', regionRequired: true, postalPattern: /^\d{5}(-\d{4})?$/, postalExample: '94103' },
  { code: 'CA', name: 'Canada', regionRequired: true, postalPattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, postalExample: 'K1A 0B1' },
  { code: 'GB', name: 'United Kingdom', regionRequired: false, postalPattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/, postalExample: 'SW1A 1AA' },
  { code: 'KE', name: 'Kenya', regionRequired: false, postalPattern: /^\d{5}$/, postalExample: '00100' },
  { code: 'NG', name: 'Nigeria', regionRequired: false, postalPattern: /^\d{6}$/, postalExample: '100001' },
  { code: 'ZA', name: 'South Africa', regionRequired: false, postalPattern: /^\d{4}$/, postalExample: '0002' },
  { code: 'GH', name: 'Ghana', regionRequired: false, postalPattern: null, postalExample: 'GA-000-0000' },
  { code: 'UG', name: 'Uganda', regionRequired: false, postalPattern: null, postalExample: '256' },
  { code: 'TZ', name: 'Tanzania', regionRequired: false, postalPattern: /^\d{5}$/, postalExample: '11101' },
  { code: 'DE', name: 'Germany', regionRequired: false, postalPattern: /^\d{5}$/, postalExample: '10115' },
  { code: 'FR', name: 'France', regionRequired: false, postalPattern: /^\d{5}$/, postalExample: '75001' },
  { code: 'IN', name: 'India', regionRequired: true, postalPattern: /^\d{6}$/, postalExample: '110001' },
  { code: 'AU', name: 'Australia', regionRequired: true, postalPattern: /^\d{4}$/, postalExample: '2000' },
]

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((country) => country.code === code)
}

export interface Address {
  id: string
  /** Optional nickname, e.g. "Home" or "Work". */
  label: string
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  /** ISO 3166-1 alpha-2 country code. */
  country: string
  isDefault: boolean
}

export type AddressInput = Omit<Address, 'id'>
export type AddressErrors = Partial<Record<keyof AddressInput, string>>

export function emptyAddressInput(country = 'US'): AddressInput {
  return { label: '', fullName: '', phone: '', line1: '', line2: '', city: '', region: '', postalCode: '', country, isDefault: false }
}

// An optional leading +, then a digit or an opening bracket ("(415) 555-0132"), then digits and common separators.
const PHONE_PATTERN = /^\+?[\d(][\d\s().-]*$/

/** Field-by-field problems with an address; an empty object means it is valid. */
export function validateAddress(input: AddressInput): AddressErrors {
  const errors: AddressErrors = {}
  const trimmed = (value: string) => value.trim()

  const label = trimmed(input.label)
  if (label.length > 30) errors.label = 'Keep the label to 30 characters or fewer.'

  const fullName = trimmed(input.fullName)
  if (!fullName) errors.fullName = 'Enter the recipient’s full name.'
  else if (fullName.length < 2 || fullName.length > 80) errors.fullName = 'Enter a name between 2 and 80 characters.'

  const phone = trimmed(input.phone)
  if (!phone) errors.phone = 'Enter a phone number the courier can call.'
  else if (!PHONE_PATTERN.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.length > 20) {
    errors.phone = 'Enter a valid phone number, like +254 700 000 000.'
  }

  const line1 = trimmed(input.line1)
  if (!line1) errors.line1 = 'Enter the street address.'
  else if (line1.length < 3 || line1.length > 100) errors.line1 = 'Enter a street address between 3 and 100 characters.'

  if (trimmed(input.line2).length > 100) errors.line2 = 'Keep this to 100 characters or fewer.'

  const city = trimmed(input.city)
  if (!city) errors.city = 'Enter the city or town.'
  else if (city.length < 2 || city.length > 60) errors.city = 'Enter a city between 2 and 60 characters.'

  const country = getCountry(input.country)
  if (!country) errors.country = 'Choose a country.'

  const region = trimmed(input.region)
  if (region.length > 60) errors.region = 'Keep this to 60 characters or fewer.'
  else if (country?.regionRequired && !region) errors.region = 'Enter the state, province or region.'

  const postalCode = trimmed(input.postalCode)
  if (!postalCode) errors.postalCode = 'Enter the postal code.'
  else if (country?.postalPattern ? !country.postalPattern.test(postalCode) : !/^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(postalCode)) {
    errors.postalCode = country ? `Enter a valid postal code, like ${country.postalExample}.` : 'Enter a valid postal code.'
  }

  return errors
}

/** Trims every text field (and upper-cases the postal code) so equal addresses are stored equally. */
export function normalizeAddress(input: AddressInput): AddressInput {
  return {
    ...input,
    label: input.label.trim(),
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    line1: input.line1.trim(),
    line2: input.line2.trim(),
    city: input.city.trim(),
    region: input.region.trim(),
    postalCode: input.postalCode.trim().toUpperCase(),
  }
}

export interface AddressChange {
  addresses: Address[]
  /** The address that was added or changed, or null if nothing happened. */
  address: Address | null
  error?: string
}

/** Adds an address. The first address is always the default; making another the default demotes the rest. */
export function addAddress(list: Address[], input: AddressInput, id: string): AddressChange {
  if (list.length >= MAX_ADDRESSES) {
    return { addresses: list, address: null, error: `You can save up to ${MAX_ADDRESSES} addresses. Remove one to add another.` }
  }
  const address: Address = { ...input, id, isDefault: list.length === 0 ? true : input.isDefault }
  const rest = address.isDefault ? list.map((existing) => ({ ...existing, isDefault: false })) : list
  return { addresses: [...rest, address], address }
}

/** Replaces an address's details. Unchecking "default" on the current default keeps it default, so one always exists. */
export function updateAddress(list: Address[], id: string, input: AddressInput): AddressChange {
  const existing = list.find((address) => address.id === id)
  if (!existing) return { addresses: list, address: null, error: 'That address no longer exists.' }
  const isDefault = existing.isDefault || input.isDefault
  const address: Address = { ...input, id, isDefault }
  const addresses = list.map((current) => {
    if (current.id === id) return address
    return isDefault ? { ...current, isDefault: false } : current
  })
  return { addresses, address }
}

/** Removes an address; if it was the default, the first remaining address becomes the default. */
export function removeAddress(list: Address[], id: string): Address[] {
  const remaining = list.filter((address) => address.id !== id)
  if (remaining.length > 0 && !remaining.some((address) => address.isDefault)) {
    return remaining.map((address, index) => (index === 0 ? { ...address, isDefault: true } : address))
  }
  return remaining
}

export function setDefaultAddress(list: Address[], id: string): Address[] {
  if (!list.some((address) => address.id === id)) return list
  return list.map((address) => ({ ...address, isDefault: address.id === id }))
}

/** The default address, or the first one, or undefined for an empty book. */
export function getDefaultAddress(list: Address[]): Address | undefined {
  return list.find((address) => address.isDefault) ?? list[0]
}

/** Human-readable lines for showing an address, skipping blanks. */
export function formatAddressLines(address: Pick<Address, 'fullName' | 'line1' | 'line2' | 'city' | 'region' | 'postalCode' | 'country'>): string[] {
  const country = getCountry(address.country)?.name ?? address.country
  const cityLine = [address.city, [address.region, address.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [address.fullName, address.line1, address.line2, cityLine, country].filter((line) => line.trim() !== '')
}

/** Turns untrusted stored data into a valid address book, ensuring exactly one default when non-empty. */
export function sanitizeAddresses(raw: unknown): Address[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const addresses: Address[] = []
  for (const item of raw) {
    if (addresses.length >= MAX_ADDRESSES) break
    if (typeof item !== 'object' || item === null) continue
    const record = item as Record<string, unknown>
    const text = (key: string): string | null => (typeof record[key] === 'string' ? (record[key] as string) : null)
    const id = text('id')
    const fullName = text('fullName')
    const line1 = text('line1')
    const city = text('city')
    const postalCode = text('postalCode')
    const country = text('country')
    if (!id || seen.has(id) || fullName === null || line1 === null || city === null || postalCode === null || country === null) continue
    seen.add(id)
    addresses.push({
      id,
      label: text('label') ?? '',
      fullName,
      phone: text('phone') ?? '',
      line1,
      line2: text('line2') ?? '',
      city,
      region: text('region') ?? '',
      postalCode,
      country,
      isDefault: record.isDefault === true,
    })
  }
  if (addresses.length === 0) return addresses
  const firstDefault = addresses.findIndex((address) => address.isDefault)
  return addresses.map((address, index) => ({ ...address, isDefault: index === (firstDefault === -1 ? 0 : firstDefault) }))
}
