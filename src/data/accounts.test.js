import { beforeEach, describe, expect, it } from 'vitest'
import { findAccountByEmail, loadAccounts, saveAccounts } from './accounts'

beforeEach(() => {
  window.localStorage.clear()
})

describe('loadAccounts / saveAccounts', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(loadAccounts()).toEqual([])
  })

  it('round-trips accounts through localStorage', () => {
    const accounts = [{ name: 'Ada', email: 'ada@example.com', passwordHash: 'abc' }]
    saveAccounts(accounts)
    expect(loadAccounts()).toEqual(accounts)
  })
})

describe('findAccountByEmail', () => {
  const accounts = [{ name: 'Ada', email: 'Ada@Example.com', passwordHash: 'abc' }]

  it('finds an account case-insensitively', () => {
    expect(findAccountByEmail(accounts, 'ada@example.com')).toEqual(accounts[0])
  })

  it('trims whitespace before comparing', () => {
    expect(findAccountByEmail(accounts, '  ada@example.com  ')).toEqual(accounts[0])
  })

  it('returns null when no account matches', () => {
    expect(findAccountByEmail(accounts, 'nobody@example.com')).toBeNull()
  })
})
