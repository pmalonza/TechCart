import { sanitizeWishlist, toggleWishlist } from './wishlist'

describe('toggleWishlist', () => {
  it('adds a new product to the front, so the newest is first', () => {
    expect(toggleWishlist(['a', 'b'], 'c')).toEqual(['c', 'a', 'b'])
    expect(toggleWishlist([], 'a')).toEqual(['a'])
  })

  it('removes a product that is already saved', () => {
    expect(toggleWishlist(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
    expect(toggleWishlist(['a'], 'a')).toEqual([])
  })

  it('is its own inverse', () => {
    const start = ['a', 'b']
    expect(toggleWishlist(toggleWishlist(start, 'z'), 'z')).toEqual(start)
  })

  it('does not mutate its input', () => {
    const start = ['a']
    toggleWishlist(start, 'b')
    expect(start).toEqual(['a'])
  })
})

describe('sanitizeWishlist', () => {
  it('keeps valid ids in order', () => {
    expect(sanitizeWishlist(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('rejects anything that is not an array', () => {
    expect(sanitizeWishlist(undefined)).toEqual([])
    expect(sanitizeWishlist(null)).toEqual([])
    expect(sanitizeWishlist('a')).toEqual([])
    expect(sanitizeWishlist({ 0: 'a' })).toEqual([])
  })

  it('drops non-strings, empty strings and duplicates', () => {
    expect(sanitizeWishlist(['a', 1, null, '', 'a', 'b', { id: 'c' }])).toEqual(['a', 'b'])
  })
})
