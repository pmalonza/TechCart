import { beforeEach, describe, expect, it } from 'vitest'
import { addReview, getReviewsForProduct } from './reviews'

describe('reviews storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array for a product with no reviews', () => {
    expect(getReviewsForProduct('tv-1')).toEqual([])
  })

  it('adds a review and retrieves it by product id', () => {
    addReview({ productId: 'tv-1', author: 'Ada', rating: 5, comment: 'Great TV!' })

    const reviews = getReviewsForProduct('tv-1')
    expect(reviews).toHaveLength(1)
    expect(reviews[0]).toMatchObject({
      productId: 'tv-1',
      author: 'Ada',
      rating: 5,
      comment: 'Great TV!',
    })
  })

  it('keeps reviews for different products separate', () => {
    addReview({ productId: 'tv-1', author: 'Ada', rating: 5, comment: 'Great TV!' })
    addReview({ productId: 'lap-1', author: 'Bea', rating: 4, comment: 'Nice laptop.' })

    expect(getReviewsForProduct('tv-1')).toHaveLength(1)
    expect(getReviewsForProduct('lap-1')).toHaveLength(1)
  })

  it('appends multiple reviews for the same product', () => {
    addReview({ productId: 'tv-1', author: 'Ada', rating: 5, comment: 'Great TV!' })
    addReview({ productId: 'tv-1', author: 'Bea', rating: 3, comment: 'It is okay.' })

    expect(getReviewsForProduct('tv-1')).toHaveLength(2)
  })
})
