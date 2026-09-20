import { MAX_SUBSCRIBERS, sanitizeSubscribers, subscribe, unsubscribe, type Subscriber } from './newsletter'

const NOW = new Date('2026-05-01T10:00:00.000Z')

describe('subscribe', () => {
  it('adds a normalised address with the time it was added', () => {
    const { list, status } = subscribe([], '  Ada@Example.COM ', NOW)
    expect(status).toBe('added')
    expect(list).toEqual([{ email: 'ada@example.com', subscribedAt: '2026-05-01T10:00:00.000Z' }])
  })

  it('does not add the same address twice, whatever its case', () => {
    const first = subscribe([], 'ada@example.com', NOW).list
    const again = subscribe(first, 'ADA@example.com', NOW)
    expect(again.status).toBe('already-subscribed')
    expect(again.list).toBe(first)
  })

  it('refuses new addresses once the list is full', () => {
    const full: Subscriber[] = Array.from({ length: MAX_SUBSCRIBERS }, (_, i) => ({ email: `user${i}@example.com`, subscribedAt: NOW.toISOString() }))
    const result = subscribe(full, 'new@example.com', NOW)
    expect(result.status).toBe('full')
    expect(result.list).toBe(full)
  })
})

describe('unsubscribe', () => {
  const list: Subscriber[] = [
    { email: 'ada@example.com', subscribedAt: NOW.toISOString() },
    { email: 'bob@example.com', subscribedAt: NOW.toISOString() },
  ]

  it('removes only the matching address, ignoring case and spaces', () => {
    const result = unsubscribe(list, ' ADA@example.com ')
    expect(result.removed).toBe(true)
    expect(result.list.map((s) => s.email)).toEqual(['bob@example.com'])
  })

  it('reports when the address was not on the list', () => {
    const result = unsubscribe(list, 'nobody@example.com')
    expect(result.removed).toBe(false)
    expect(result.list).toEqual(list)
  })
})

describe('sanitizeSubscribers', () => {
  const good = { email: 'ada@example.com', subscribedAt: '2026-05-01T10:00:00.000Z' }

  it('keeps valid subscribers', () => {
    expect(sanitizeSubscribers([good])).toEqual([good])
  })

  it('returns an empty list for non-arrays', () => {
    for (const raw of [undefined, null, {}, 'x', 7]) expect(sanitizeSubscribers(raw)).toEqual([])
  })

  it('drops malformed entries, bad addresses and bad dates', () => {
    const broken = [null, 'x', { email: 5, subscribedAt: good.subscribedAt }, { email: 'not-an-email', subscribedAt: good.subscribedAt }, { email: 'b@example.com', subscribedAt: 'yesterday' }, { email: 'c@example.com' }]
    expect(sanitizeSubscribers(broken)).toEqual([])
  })

  it('normalises addresses and drops duplicates', () => {
    expect(sanitizeSubscribers([{ ...good, email: 'ADA@Example.com' }, good])).toEqual([good])
  })

  it('never returns more than the cap', () => {
    const many = Array.from({ length: MAX_SUBSCRIBERS + 20 }, (_, i) => ({ email: `user${i}@example.com`, subscribedAt: good.subscribedAt }))
    expect(sanitizeSubscribers(many)).toHaveLength(MAX_SUBSCRIBERS)
  })
})
