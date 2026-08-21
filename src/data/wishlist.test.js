import { beforeEach, describe, expect, it } from 'vitest'
import { loadWishlist, saveWishlist } from './wishlist'

describe('wishlist storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when nothing is stored', () => {
    expect(loadWishlist('ada@gmail.com')).toEqual([])
    expect(loadWishlist(null)).toEqual([])
  })

  it('round-trips a wishlist for a signed-in account', () => {
    saveWishlist('ada@gmail.com', ['tv-1', 'lap-2'])
    expect(loadWishlist('ada@gmail.com')).toEqual(['tv-1', 'lap-2'])
  })

  it('keeps the guest wishlist and an account wishlist separate', () => {
    saveWishlist(null, ['tv-1'])
    saveWishlist('ada@gmail.com', ['lap-2'])

    expect(loadWishlist(null)).toEqual(['tv-1'])
    expect(loadWishlist('ada@gmail.com')).toEqual(['lap-2'])
  })

  it('is case-insensitive on the account email', () => {
    saveWishlist('Ada@Gmail.com', ['tv-1'])
    expect(loadWishlist('ada@gmail.com')).toEqual(['tv-1'])
  })
})
