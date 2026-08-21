import { beforeEach, describe, expect, it } from 'vitest'
import { loadAddresses, saveAddresses } from './addresses'

describe('address book storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when nothing is stored', () => {
    expect(loadAddresses('ada@gmail.com')).toEqual([])
    expect(loadAddresses(null)).toEqual([])
  })

  it('round-trips addresses for a signed-in account', () => {
    const addresses = [{ id: 'addr-1', label: 'Home', street: '123 Main St', city: 'Springfield', postalCode: '12345', isDefault: true }]
    saveAddresses('ada@gmail.com', addresses)
    expect(loadAddresses('ada@gmail.com')).toEqual(addresses)
  })

  it('keeps the guest address book and an account address book separate', () => {
    saveAddresses(null, [{ id: 'addr-1' }])
    saveAddresses('ada@gmail.com', [{ id: 'addr-2' }])

    expect(loadAddresses(null)).toEqual([{ id: 'addr-1' }])
    expect(loadAddresses('ada@gmail.com')).toEqual([{ id: 'addr-2' }])
  })

  it('is case-insensitive on the account email', () => {
    saveAddresses('Ada@Gmail.com', [{ id: 'addr-1' }])
    expect(loadAddresses('ada@gmail.com')).toEqual([{ id: 'addr-1' }])
  })
})
