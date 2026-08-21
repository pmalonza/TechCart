import { beforeEach, describe, expect, it } from 'vitest'
import { isNewsletterSubscriber, subscribeToNewsletter } from './newsletter'

describe('newsletter subscriptions', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('subscribes a new email', () => {
    const result = subscribeToNewsletter('ada@gmail.com')
    expect(result.ok).toBe(true)
    expect(isNewsletterSubscriber('ada@gmail.com')).toBe(true)
  })

  it('is case-insensitive and trims whitespace', () => {
    subscribeToNewsletter('  Ada@Gmail.com  ')
    expect(isNewsletterSubscriber('ada@gmail.com')).toBe(true)
  })

  it('rejects subscribing the same email twice', () => {
    subscribeToNewsletter('ada@gmail.com')
    const result = subscribeToNewsletter('ada@gmail.com')
    expect(result.ok).toBe(false)
    expect(result.message).toBe('This email is already subscribed.')
  })

  it('reports an unsubscribed email as not subscribed', () => {
    expect(isNewsletterSubscriber('nobody@gmail.com')).toBe(false)
  })
})
