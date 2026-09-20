import { sanitizeAddresses, type Address } from './addresses'

/**
 * Client-side account helpers.
 *
 * This is a front-end demo: accounts live in the browser's localStorage, so
 * anyone with access to the browser profile can read them. Passwords are
 * still never stored in the clear -- they are salted and hashed with
 * PBKDF2-SHA256 -- but this is NOT a substitute for a real authentication
 * server.
 */

export interface User {
  id: string
  name: string
  email: string
  /** Hex-encoded PBKDF2-SHA256 hash of the password. */
  passwordHash: string
  /** Hex-encoded random per-user salt. */
  salt: string
  /** PBKDF2 iteration count used for `passwordHash`, stored so it can be raised later. */
  iterations: number
  createdAt: string
  /** Saved delivery addresses; exactly one is the default when the list is non-empty. */
  addresses: Address[]
}

/** A user with the credential fields removed, safe to hand to UI components. */
export type PublicUser = Omit<User, 'passwordHash' | 'salt' | 'iterations' | 'addresses'>

/** High for real use; low under test so the suite stays fast (the algorithm is identical). */
export const HASH_ITERATIONS = import.meta.env.MODE === 'test' ? 1_000 : 310_000

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(email: string): string | null {
  const value = email.trim()
  if (!value) return 'Enter your email address.'
  if (value.length > 254 || !EMAIL_PATTERN.test(value)) return 'Enter a valid email address, like name@example.com.'
  return null
}

export function validateName(name: string): string | null {
  const value = name.trim()
  if (!value) return 'Enter your name.'
  if (value.length < 2) return 'Your name must be at least 2 characters.'
  if (value.length > 60) return 'Your name must be 60 characters or fewer.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Enter a password.'
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`
  if (password.length > PASSWORD_MAX_LENGTH) return `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Include at least one letter and one number.'
  return null
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

/** A cryptographically random hex string of `byteLength` bytes. */
export function randomHex(byteLength = 16): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(byteLength)))
}

export function newId(): string {
  return crypto.randomUUID()
}

/** Derives a password hash with PBKDF2-SHA256. */
export async function hashPassword(password: string, saltHex: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations },
    key,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

/** Constant-time string comparison, so a wrong guess does not reveal how much of the hash matched. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return difference === 0
}

export async function verifyPassword(password: string, user: Pick<User, 'passwordHash' | 'salt' | 'iterations'>): Promise<boolean> {
  const hash = await hashPassword(password, user.salt, user.iterations)
  return safeEqual(hash, user.passwordHash)
}

/** Builds the credential fields for a new password (fresh random salt). */
export async function createCredentials(password: string): Promise<Pick<User, 'passwordHash' | 'salt' | 'iterations'>> {
  const salt = randomHex(16)
  return { salt, iterations: HASH_ITERATIONS, passwordHash: await hashPassword(password, salt, HASH_ITERATIONS) }
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
}

/** Turns untrusted stored data into valid users, dropping malformed records and duplicate ids/emails. */
export function sanitizeUsers(raw: unknown): User[] {
  if (!Array.isArray(raw)) return []
  const ids = new Set<string>()
  const emails = new Set<string>()
  const users: User[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const record = item as Record<string, unknown>
    const { id, name, email, passwordHash, salt, iterations, createdAt } = record
    if (typeof id !== 'string' || typeof name !== 'string' || typeof email !== 'string') continue
    if (typeof passwordHash !== 'string' || typeof salt !== 'string') continue
    if (typeof iterations !== 'number' || !Number.isInteger(iterations) || iterations < 1) continue
    if (typeof createdAt !== 'string') continue
    const normalized = normalizeEmail(email)
    if (ids.has(id) || emails.has(normalized)) continue
    ids.add(id)
    emails.add(normalized)
    users.push({ id, name, email: normalized, passwordHash, salt, iterations, createdAt, addresses: sanitizeAddresses(record.addresses) })
  }
  return users
}

export function sanitizeSession(raw: unknown): string | null {
  return typeof raw === 'string' && raw !== '' ? raw : null
}

/**
 * Only allows an in-app path as a post-login destination, so a crafted link
 * cannot bounce a visitor to another site after they sign in.
 */
export function safeRedirectPath(from: unknown, fallback = '/account'): string {
  if (typeof from !== 'object' || from === null) return fallback
  const { pathname, search } = from as { pathname?: unknown; search?: unknown }
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')) return fallback
  return pathname + (typeof search === 'string' ? search : '')
}
