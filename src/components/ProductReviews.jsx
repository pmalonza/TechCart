import { useState } from 'react'
import { addReview, getReviewsForProduct } from '../data/reviews'

const RATING_OPTIONS = [5, 4, 3, 2, 1]

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState(() => getReviewsForProduct(productId))
  const [form, setForm] = useState({ author: '', rating: '5', comment: '' })
  const [error, setError] = useState('')

  const average =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.author.trim()) {
      setError('Enter your name.')
      return
    }
    if (!form.comment.trim()) {
      setError('Enter a review.')
      return
    }

    setError('')
    const review = addReview({
      productId,
      author: form.author.trim(),
      rating: Number(form.rating),
      comment: form.comment.trim(),
    })
    setReviews((prev) => [...prev, review])
    setForm({ author: '', rating: '5', comment: '' })
  }

  return (
    <section className="product-reviews" aria-label="Reviews">
      <h3>Reviews{average !== null ? ` — ${average.toFixed(1)} avg (${reviews.length})` : ''}</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review this product.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => (
            <li key={review.id} className="review-item">
              <p className="review-item-header">
                <span className="review-item-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </span>
                <span className="review-item-author">{review.author}</span>
              </p>
              <p className="review-item-comment">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="auth-form review-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="review-author">Your name</label>
          <input id="review-author" name="author" type="text" value={form.author} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="review-rating">Rating</label>
          <select id="review-rating" name="rating" value={form.rating} onChange={handleChange}>
            {RATING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} star{value !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field review-comment-field">
          <label htmlFor="review-comment">Review</label>
          <textarea id="review-comment" name="comment" rows={3} value={form.comment} onChange={handleChange} />
        </div>
        <button type="submit" className="add-button">
          Submit review
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
