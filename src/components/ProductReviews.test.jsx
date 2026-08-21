import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductReviews from './ProductReviews'
import { addReview } from '../data/reviews'

describe('ProductReviews', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty state with no reviews', () => {
    render(<ProductReviews productId="tv-1" />)
    expect(screen.getByText('No reviews yet. Be the first to review this product.')).toBeInTheDocument()
  })

  it('lists existing reviews with the average rating', () => {
    addReview({ productId: 'tv-1', author: 'Ada', rating: 5, comment: 'Great TV!' })
    addReview({ productId: 'tv-1', author: 'Bea', rating: 3, comment: 'It is okay.' })

    render(<ProductReviews productId="tv-1" />)

    expect(screen.getByRole('heading', { name: /Reviews — 4.0 avg \(2\)/ })).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Great TV!')).toBeInTheDocument()
    expect(screen.getByText('Bea')).toBeInTheDocument()
    expect(screen.getByText('It is okay.')).toBeInTheDocument()
  })

  it('only shows reviews for the given product', () => {
    addReview({ productId: 'tv-1', author: 'Ada', rating: 5, comment: 'Great TV!' })
    addReview({ productId: 'lap-1', author: 'Bea', rating: 4, comment: 'Nice laptop.' })

    render(<ProductReviews productId="tv-1" />)

    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.queryByText('Bea')).not.toBeInTheDocument()
  })

  it('rejects a submission with no name', async () => {
    const user = userEvent.setup()
    render(<ProductReviews productId="tv-1" />)

    await user.type(screen.getByLabelText('Review'), 'Pretty good.')
    await user.click(screen.getByRole('button', { name: 'Submit review' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name.')
  })

  it('rejects a submission with no comment', async () => {
    const user = userEvent.setup()
    render(<ProductReviews productId="tv-1" />)

    await user.type(screen.getByLabelText('Your name'), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Submit review' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a review.')
  })

  it('submits a review with the selected rating and shows it in the list', async () => {
    const user = userEvent.setup()
    render(<ProductReviews productId="tv-1" />)

    await user.type(screen.getByLabelText('Your name'), 'Ada')
    await user.selectOptions(screen.getByLabelText('Rating'), '2')
    await user.type(screen.getByLabelText('Review'), 'Disappointing picture quality.')
    await user.click(screen.getByRole('button', { name: 'Submit review' }))

    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Disappointing picture quality.')).toBeInTheDocument()
    expect(screen.getByLabelText('2 out of 5 stars')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('')
  })
})
