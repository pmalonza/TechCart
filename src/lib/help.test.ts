import { FAQS } from '../data/faq'
import {
  CONTACT_TOPICS,
  FAQ_TOPICS,
  MAX_MESSAGES,
  MESSAGE_MAX,
  filterFaqs,
  isContactTopic,
  sanitizeMessages,
  topicLabel,
  validateContact,
  type ContactInput,
  type ContactMessage,
  type Faq,
} from './help'

const valid: ContactInput = { name: 'Ada Lovelace', email: 'ada@example.com', topic: 'order', message: 'My order has not arrived yet, please help.' }

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(validateContact(valid)).toEqual({})
  })

  it('requires every field', () => {
    const errors = validateContact({ name: '', email: '', topic: '', message: '' })
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name', 'topic'])
  })

  it('checks the email, topic and message length', () => {
    expect(validateContact({ ...valid, email: 'nope' }).email).toBeDefined()
    expect(validateContact({ ...valid, topic: 'billing' }).topic).toBeDefined()
    expect(validateContact({ ...valid, message: 'too short' }).message).toMatch(/at least 10/)
    expect(validateContact({ ...valid, message: '   short   ' }).message).toBeDefined()
    expect(validateContact({ ...valid, message: 'x'.repeat(MESSAGE_MAX + 1) }).message).toMatch(/1,000/)
    expect(validateContact({ ...valid, message: 'x'.repeat(MESSAGE_MAX) }).message).toBeUndefined()
  })
})

describe('topics', () => {
  it('recognises only known topics and labels each one', () => {
    for (const { value, label } of CONTACT_TOPICS) {
      expect(isContactTopic(value)).toBe(true)
      expect(topicLabel(value)).toBe(label)
    }
    for (const bad of ['', 'billing', undefined, 3]) expect(isContactTopic(bad)).toBe(false)
  })
})

describe('sanitizeMessages', () => {
  const good: ContactMessage = { id: 'm1', reference: 'MSG-3F9A1C', name: 'Ada', email: 'ada@example.com', topic: 'order', message: 'Hello there, a message.', createdAt: '2026-09-20T10:00:00.000Z' }

  it('keeps valid messages', () => {
    expect(sanitizeMessages([good])).toEqual([good])
  })

  it('returns an empty list for non-arrays', () => {
    for (const raw of [undefined, null, {}, 'x', 4]) expect(sanitizeMessages(raw)).toEqual([])
  })

  it('drops malformed entries and repeated ids', () => {
    const broken = [null, 'x', { ...good, id: '' }, { ...good, topic: 'billing' }, { ...good, createdAt: 'yesterday' }, { ...good, message: 'x'.repeat(MESSAGE_MAX + 1) }, { ...good, name: 5 }, { ...good, reference: 'R'.repeat(21) }]
    expect(sanitizeMessages(broken)).toEqual([])
    expect(sanitizeMessages([good, { ...good, message: 'A repeated id, should be dropped.' }])).toEqual([good])
  })

  it('never returns more than the cap', () => {
    const many = Array.from({ length: MAX_MESSAGES + 5 }, (_, i) => ({ ...good, id: `m${i}` }))
    expect(sanitizeMessages(many)).toHaveLength(MAX_MESSAGES)
  })
})

describe('filterFaqs', () => {
  const faqs: Faq[] = [
    { id: 'a', topic: 'orders', question: 'How much does delivery cost?', answer: 'Standard is $4.99.' },
    { id: 'b', topic: 'account', question: 'I forgot my password', answer: 'Use the reset page.' },
    { id: 'c', topic: 'selling', question: 'Add a photo?', answer: 'Choose a JPEG or PNG.' },
  ]

  it('keeps everything for an empty or blank query', () => {
    expect(filterFaqs(faqs, '')).toBe(faqs)
    expect(filterFaqs(faqs, '   ')).toBe(faqs)
  })

  it('matches words in the question or the answer, ignoring case', () => {
    expect(filterFaqs(faqs, 'DELIVERY').map((f) => f.id)).toEqual(['a'])
    expect(filterFaqs(faqs, 'png').map((f) => f.id)).toEqual(['c'])
  })

  it('requires every word to match, in any order', () => {
    expect(filterFaqs(faqs, 'reset password').map((f) => f.id)).toEqual(['b'])
    expect(filterFaqs(faqs, 'password delivery')).toEqual([])
  })
})

describe('the FAQ list', () => {
  it('has unique ids and only known topics', () => {
    expect(new Set(FAQS.map((faq) => faq.id)).size).toBe(FAQS.length)
    const topics = FAQ_TOPICS.map((topic) => topic.id)
    for (const faq of FAQS) expect(topics).toContain(faq.topic)
  })

  it('has at least one question in every topic', () => {
    for (const topic of FAQ_TOPICS) expect(FAQS.some((faq) => faq.topic === topic.id)).toBe(true)
  })

  it('only links to routes the app has', () => {
    const routes = ['/register', '/account/orders', '/cart', '/forgot-password', '/account/security', '/account/addresses', '/newsletter/unsubscribe', '/account/listings', '/terms', '/privacy']
    for (const faq of FAQS) if (faq.link) expect(routes, faq.id).toContain(faq.link.to)
  })
})
