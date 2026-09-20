interface RatingProps {
  rating: number
  reviewCount?: number
}

export default function Rating({ rating, reviewCount }: RatingProps) {
  if (reviewCount === 0) return <span className="rating rating-none">No reviews yet</span>
  const label = `${rating.toFixed(1)} out of 5 stars${reviewCount !== undefined ? `, ${reviewCount.toLocaleString('en-US')} reviews` : ''}`
  return (
    <span className="rating">
      <span className="stars" role="img" aria-label={label}>
        <span className="stars-fill" style={{ width: `${(rating / 5) * 100}%` }} aria-hidden="true">
          ★★★★★
        </span>
        <span className="stars-base" aria-hidden="true">
          ★★★★★
        </span>
      </span>
      {reviewCount !== undefined && (
        <span className="rating-count" aria-hidden="true">
          ({reviewCount.toLocaleString('en-US')})
        </span>
      )}
    </span>
  )
}
