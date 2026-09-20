import {
  RESET_TOKEN_TTL_MS,
  addResetRecord,
  createResetToken,
  findValidRecord,
  pruneResetRecords,
  removeRecordsForUser,
  sanitizeResetRecords,
  sha256Hex,
  type ResetRecord,
} from './passwordReset'

const NOW = 1_700_000_000_000
const record = (overrides: Partial<ResetRecord> = {}): ResetRecord => ({
  tokenHash: 'hash-a',
  userId: 'u1',
  expiresAt: NOW + 1000,
  ...overrides,
})

describe('sha256Hex', () => {
  it('matches the known SHA-256 test vectors', async () => {
    expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('createResetToken', () => {
  it('makes a 256-bit random token and stores only its hash', async () => {
    const { token, record: stored } = await createResetToken('u1', NOW)
    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(stored.tokenHash).toBe(await sha256Hex(token))
    expect(JSON.stringify(stored)).not.toContain(token)
    expect(stored.userId).toBe('u1')
  })

  it('expires after the time-to-live', async () => {
    const { record: stored } = await createResetToken('u1', NOW)
    expect(stored.expiresAt).toBe(NOW + RESET_TOKEN_TTL_MS)
    expect(RESET_TOKEN_TTL_MS).toBe(30 * 60 * 1000)
  })

  it('never repeats a token', async () => {
    const first = await createResetToken('u1', NOW)
    const second = await createResetToken('u1', NOW)
    expect(first.token).not.toBe(second.token)
  })
})

describe('pruneResetRecords and findValidRecord', () => {
  it('drops expired records and keeps live ones', () => {
    const records = [record({ tokenHash: 'live', expiresAt: NOW + 1 }), record({ tokenHash: 'dead', expiresAt: NOW - 1 })]
    expect(pruneResetRecords(records, NOW).map((r) => r.tokenHash)).toEqual(['live'])
  })

  it('treats a record as expired at exactly its expiry time', () => {
    expect(pruneResetRecords([record({ expiresAt: NOW })], NOW)).toEqual([])
    expect(findValidRecord([record({ expiresAt: NOW })], 'hash-a', NOW)).toBeUndefined()
  })

  it('finds a live record by hash and nothing else', () => {
    const records = [record()]
    expect(findValidRecord(records, 'hash-a', NOW)).toBe(records[0])
    expect(findValidRecord(records, 'other', NOW)).toBeUndefined()
    expect(findValidRecord(records, 'hash-a', NOW + 5000)).toBeUndefined()
  })
})

describe('addResetRecord', () => {
  it('replaces an earlier link for the same account so only the newest works', () => {
    const older = record({ tokenHash: 'old' })
    const newer = record({ tokenHash: 'new' })
    expect(addResetRecord([older], newer, NOW)).toEqual([newer])
  })

  it('leaves other accounts alone and prunes expired records while it is at it', () => {
    const other = record({ userId: 'u2', tokenHash: 'other' })
    const expired = record({ userId: 'u3', tokenHash: 'expired', expiresAt: NOW - 1 })
    const added = record({ tokenHash: 'new' })
    expect(addResetRecord([other, expired], added, NOW)).toEqual([other, added])
  })
})

describe('removeRecordsForUser', () => {
  it('removes only that user’s records', () => {
    const records = [record({ userId: 'u1' }), record({ userId: 'u2', tokenHash: 'b' })]
    expect(removeRecordsForUser(records, 'u1')).toEqual([records[1]])
  })
})

describe('sanitizeResetRecords', () => {
  it('keeps valid records', () => {
    expect(sanitizeResetRecords([record()])).toEqual([record()])
  })

  it('rejects non-arrays and drops malformed records', () => {
    expect(sanitizeResetRecords(undefined)).toEqual([])
    expect(sanitizeResetRecords('x')).toEqual([])
    expect(
      sanitizeResetRecords([record(), { tokenHash: 1 }, null, { tokenHash: 'a', userId: 'b', expiresAt: 'soon' }, { tokenHash: 'a', userId: 'b', expiresAt: NaN }]),
    ).toEqual([record()])
  })
})
