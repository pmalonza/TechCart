const REVIEWS_KEY = 'techcart:reviews'

function loadAllReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getReviewsForProduct(productId) {
  return loadAllReviews().filter((review) => review.productId === productId)
}

export function addReview({ productId, author, rating, comment }) {
  const reviews = loadAllReviews()
  const review = {
    id: `review-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    productId,
    author,
    rating,
    comment,
  }
  reviews.push(review)
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  return review
}
