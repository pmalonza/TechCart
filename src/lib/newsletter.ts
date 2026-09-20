import { normalizeEmail, validateEmail } from './auth'

export interface Subscriber {
  /** Lower-cased, trimmed address. */
  email: string
  subscribedAt: string
}

/** A safety cap so a runaway loop or hand-edited storage cannot fill localStorage. */
export const MAX_SUBSCRIBERS = 500

export type SubscribeStatus = 'added' | 'already-subscribed' | 'full'

export function subscribe(list: Subscriber[], email: string, now: Date): { list: Subscriber[]; status: SubscribeStatus } {
  const address = normalizeEmail(email)
  if (list.some((subscriber) => subscriber.email === address)) return { list, status: 'already-subscribed' }
  if (list.length >= MAX_SUBSCRIBERS) return { list, status: 'full' }
  return { list: [...list, { email: address, subscribedAt: now.toISOString() }], status: 'added' }
}

export function unsubscribe(list: Subscriber[], email: string): { list: Subscriber[]; removed: boolean } {
  const address = normalizeEmail(email)
  const next = list.filter((subscriber) => subscriber.email !== address)
  return { list: next, removed: next.length !== list.length }
}

/** Turns untrusted stored data into a valid subscriber list: well-formed, unique addresses only. */
export function sanitizeSubscribers(raw: unknown): Subscriber[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const subscribers: Subscriber[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { email, subscribedAt } = item as Record<string, unknown>
    if (typeof email !== 'string' || validateEmail(email) !== null) continue
    const address = normalizeEmail(email)
    if (seen.has(address) || typeof subscribedAt !== 'string' || Number.isNaN(Date.parse(subscribedAt))) continue
    seen.add(address)
    subscribers.push({ email: address, subscribedAt })
    if (subscribers.length >= MAX_SUBSCRIBERS) break
  }
  return subscribers
}
