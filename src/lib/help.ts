import { validateEmail, validateName } from './auth'

export type ContactTopic = 'order' | 'account' | 'selling' | 'other'

export const CONTACT_TOPICS: { value: ContactTopic; label: string }[] = [
  { value: 'order', label: 'An order or delivery' },
  { value: 'account', label: 'My account or password' },
  { value: 'selling', label: 'Listing a product' },
  { value: 'other', label: 'Something else' },
]

export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 1000
/** Saved messages are kept in the browser, so the count is capped. */
export const MAX_MESSAGES = 20

export function isContactTopic(value: unknown): value is ContactTopic {
  return CONTACT_TOPICS.some((topic) => topic.value === value)
}

export function topicLabel(topic: ContactTopic): string {
  return CONTACT_TOPICS.find((candidate) => candidate.value === topic)!.label
}

/** The contact form as typed. */
export interface ContactInput {
  name: string
  email: string
  topic: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {}
  const nameProblem = validateName(input.name)
  if (nameProblem) errors.name = nameProblem
  const emailProblem = validateEmail(input.email)
  if (emailProblem) errors.email = emailProblem
  if (!isContactTopic(input.topic)) errors.topic = 'Choose what your message is about.'
  const message = input.message.trim()
  if (message.length < MESSAGE_MIN) errors.message = `Write at least ${MESSAGE_MIN} characters so we can help.`
  else if (message.length > MESSAGE_MAX) errors.message = `Keep your message to ${MESSAGE_MAX.toLocaleString('en-US')} characters or fewer.`
  return errors
}

export interface ContactMessage {
  id: string
  /** Shown to the person so they can refer to the message, e.g. MSG-3F9A1C. */
  reference: string
  name: string
  email: string
  topic: ContactTopic
  message: string
  createdAt: string
}

const isString = (value: unknown): value is string => typeof value === 'string'

/** Turns untrusted stored data into valid saved messages, newest first, capped at MAX_MESSAGES. */
export function sanitizeMessages(raw: unknown): ContactMessage[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const messages: ContactMessage[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { id, reference, name, email, topic, message, createdAt } = item as Record<string, unknown>
    if (!isString(id) || id === '' || id.length > 64 || seen.has(id)) continue
    if (!isString(reference) || reference.length > 20 || !isString(name) || name.length > 60 || !isString(email) || email.length > 254) continue
    if (!isContactTopic(topic) || !isString(message) || message.length > MESSAGE_MAX) continue
    if (!isString(createdAt) || Number.isNaN(Date.parse(createdAt))) continue
    seen.add(id)
    messages.push({ id, reference, name, email, topic, message, createdAt })
    if (messages.length >= MAX_MESSAGES) break
  }
  return messages
}

/** One frequently asked question. Answers are plain text so the filter can search them. */
export interface Faq {
  id: string
  topic: FaqTopic
  question: string
  answer: string
  /** An optional page that helps with this question. */
  link?: { to: string; label: string }
}

export type FaqTopic = 'orders' | 'account' | 'selling' | 'demo'

export const FAQ_TOPICS: { id: FaqTopic; name: string }[] = [
  { id: 'orders', name: 'Orders and delivery' },
  { id: 'account', name: 'Your account' },
  { id: 'selling', name: 'Selling' },
  { id: 'demo', name: 'About this demo' },
]

/** Questions whose text contains every word of `query` (any case). An empty query keeps them all. */
export function filterFaqs(faqs: Faq[], query: string): Faq[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return faqs
  return faqs.filter((faq) => {
    const text = `${faq.question} ${faq.answer}`.toLowerCase()
    return words.every((word) => text.includes(word))
  })
}
