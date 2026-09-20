import {
  HASH_ITERATIONS,
  createCredentials,
  hashPassword,
  normalizeEmail,
  randomHex,
  safeRedirectPath,
  sanitizeSession,
  sanitizeUsers,
  toPublicUser,
  validateEmail,
  validateName,
  validatePassword,
  verifyPassword,
  type User,
} from './auth'

const validUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  passwordHash: 'aa',
  salt: 'bb',
  iterations: 1000,
  createdAt: '2026-01-01T00:00:00.000Z',
  addresses: [],
  ...overrides,
})

describe('validateEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(validateEmail('name@example.com')).toBeNull()
    expect(validateEmail('  first.last+tag@sub.example.co.ke  ')).toBeNull()
  })

  it.each(['', '   ', 'no-at-sign', 'a@b', 'a b@example.com', '@example.com', 'a@.com', 'a@b.c'])('rejects %j', (value) => {
    expect(validateEmail(value)).not.toBeNull()
  })

  it('rejects absurdly long addresses', () => {
    expect(validateEmail(`${'a'.repeat(250)}@example.com`)).not.toBeNull()
  })
})

describe('validateName', () => {
  it('accepts normal names and trims before measuring', () => {
    expect(validateName('Jo')).toBeNull()
    expect(validateName('  Peter Malonza  ')).toBeNull()
  })

  it('rejects empty, one-character and overlong names', () => {
    expect(validateName('')).not.toBeNull()
    expect(validateName('   ')).not.toBeNull()
    expect(validateName('A')).not.toBeNull()
    expect(validateName('x'.repeat(61))).not.toBeNull()
  })
})

describe('validatePassword', () => {
  it('accepts a password with letters and numbers of sufficient length', () => {
    expect(validatePassword('correct8horse')).toBeNull()
    expect(validatePassword('Abcdefg1')).toBeNull()
  })

  it('rejects empty, short, letter-only, number-only and overlong passwords', () => {
    expect(validatePassword('')).toMatch(/enter a password/i)
    expect(validatePassword('abc123')).toMatch(/at least 8/i)
    expect(validatePassword('abcdefghij')).toMatch(/letter and one number/i)
    expect(validatePassword('1234567890')).toMatch(/letter and one number/i)
    expect(validatePassword(`a1${'x'.repeat(200)}`)).toMatch(/128/)
  })
})

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com')
  })
})

describe('password hashing', () => {
  it('is deterministic for the same password, salt and iteration count', async () => {
    expect(await hashPassword('secret123', 'abcd', 1000)).toBe(await hashPassword('secret123', 'abcd', 1000))
  })

  it('produces a 256-bit (64 hex character) hash', async () => {
    expect(await hashPassword('secret123', 'abcd', 1000)).toMatch(/^[0-9a-f]{64}$/)
  })

  it('differs for a different password, salt or iteration count', async () => {
    const base = await hashPassword('secret123', 'abcd', 1000)
    expect(await hashPassword('secret124', 'abcd', 1000)).not.toBe(base)
    expect(await hashPassword('secret123', 'abce', 1000)).not.toBe(base)
    expect(await hashPassword('secret123', 'abcd', 1001)).not.toBe(base)
  })

  it('matches a known PBKDF2-HMAC-SHA256 test vector', async () => {
    // RFC 7914 section 11: PBKDF2-HMAC-SHA-256, P="passwd", S="salt", c=1, dkLen=64 (first 32 bytes checked).
    const salt = Array.from(new TextEncoder().encode('salt'), (b) => b.toString(16).padStart(2, '0')).join('')
    expect(await hashPassword('passwd', salt, 1)).toBe('55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc')
  })

  it('creates credentials that verify the right password and reject wrong ones', async () => {
    const credentials = await createCredentials('correct8horse')
    expect(credentials.iterations).toBe(HASH_ITERATIONS)
    expect(await verifyPassword('correct8horse', credentials)).toBe(true)
    expect(await verifyPassword('Correct8horse', credentials)).toBe(false)
    expect(await verifyPassword('', credentials)).toBe(false)
  })

  it('never stores the password and uses a fresh salt each time', async () => {
    const first = await createCredentials('correct8horse')
    const second = await createCredentials('correct8horse')
    expect(first.salt).not.toBe(second.salt)
    expect(first.passwordHash).not.toBe(second.passwordHash)
    expect(JSON.stringify(first)).not.toContain('correct8horse')
  })
})

describe('randomHex', () => {
  it('returns the requested number of random bytes as hex', () => {
    expect(randomHex(16)).toMatch(/^[0-9a-f]{32}$/)
    expect(randomHex(16)).not.toBe(randomHex(16))
  })
})

describe('toPublicUser', () => {
  it('strips every credential field', () => {
    expect(toPublicUser(validUser())).toEqual({
      id: 'u1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  })
})

describe('sanitizeUsers', () => {
  it('keeps valid users and normalises emails', () => {
    expect(sanitizeUsers([validUser({ email: 'ADA@Example.com' })])[0].email).toBe('ada@example.com')
  })

  it('rejects non-arrays', () => {
    expect(sanitizeUsers(null)).toEqual([])
    expect(sanitizeUsers({})).toEqual([])
  })

  it('drops malformed records', () => {
    const { passwordHash: _hash, ...noHash } = validUser({ id: 'u2', email: 'b@example.com' })
    expect(
      sanitizeUsers([
        validUser(),
        noHash,
        validUser({ id: 'u3', email: 'c@example.com', iterations: 0 }),
        validUser({ id: 'u4', email: 'd@example.com', iterations: 1.5 }),
        'junk',
        null,
        { id: 5 },
      ]),
    ).toHaveLength(1)
  })

  it('drops duplicate ids and duplicate emails', () => {
    const result = sanitizeUsers([
      validUser(),
      validUser({ email: 'other@example.com' }),
      validUser({ id: 'u9', email: 'ADA@example.com' }),
    ])
    expect(result).toHaveLength(1)
  })
})

describe('sanitizeSession', () => {
  it('accepts a non-empty string only', () => {
    expect(sanitizeSession('u1')).toBe('u1')
    expect(sanitizeSession('')).toBeNull()
    expect(sanitizeSession(5)).toBeNull()
    expect(sanitizeSession(null)).toBeNull()
  })
})

describe('safeRedirectPath', () => {
  it('allows in-app paths, keeping the query string', () => {
    expect(safeRedirectPath({ pathname: '/checkout', search: '?a=1' })).toBe('/checkout?a=1')
    expect(safeRedirectPath({ pathname: '/wishlist' })).toBe('/wishlist')
  })

  it('falls back for anything that could leave the site or is malformed', () => {
    expect(safeRedirectPath({ pathname: '//evil.example.com' })).toBe('/account')
    expect(safeRedirectPath({ pathname: 'https://evil.example.com' })).toBe('/account')
    expect(safeRedirectPath({ pathname: 42 })).toBe('/account')
    expect(safeRedirectPath('/checkout')).toBe('/account')
    expect(safeRedirectPath(undefined)).toBe('/account')
    expect(safeRedirectPath(null, '/somewhere')).toBe('/somewhere')
  })
})
