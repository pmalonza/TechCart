import { randomHex } from './auth'

/** How long a password-reset link stays valid. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000

/**
 * A stored reset request. Only a hash of the token is kept, so reading
 * localStorage does not reveal a usable reset link.
 */
export interface ResetRecord {
  tokenHash: string
  userId: string
  /** Milliseconds since the epoch. */
  expiresAt: number
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Makes a new random token (256 bits) and the record to store for it. */
export async function createResetToken(userId: string, now: number): Promise<{ token: string; record: ResetRecord }> {
  const token = randomHex(32)
  return { token, record: { tokenHash: await sha256Hex(token), userId, expiresAt: now + RESET_TOKEN_TTL_MS } }
}

/** Drops expired records. */
export function pruneResetRecords(records: ResetRecord[], now: number): ResetRecord[] {
  return records.filter((record) => record.expiresAt > now)
}

/**
 * Adds a record for `userId`, replacing any earlier one: only the most recent
 * reset link for an account works, so an old email cannot be used later.
 */
export function addResetRecord(records: ResetRecord[], record: ResetRecord, now: number): ResetRecord[] {
  return [...pruneResetRecords(records, now).filter((existing) => existing.userId !== record.userId), record]
}

/** Finds the unexpired record matching a token hash. */
export function findValidRecord(records: ResetRecord[], tokenHash: string, now: number): ResetRecord | undefined {
  return records.find((record) => record.tokenHash === tokenHash && record.expiresAt > now)
}

/** Removes every reset record for a user (used after a successful reset, so a link is single-use). */
export function removeRecordsForUser(records: ResetRecord[], userId: string): ResetRecord[] {
  return records.filter((record) => record.userId !== userId)
}

export function sanitizeResetRecords(raw: unknown): ResetRecord[] {
  if (!Array.isArray(raw)) return []
  const records: ResetRecord[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { tokenHash, userId, expiresAt } = item as Record<string, unknown>
    if (typeof tokenHash !== 'string' || typeof userId !== 'string') continue
    if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) continue
    records.push({ tokenHash, userId, expiresAt })
  }
  return records
}
