import { render, screen } from '@testing-library/react'
import ProductImage from './ProductImage'
import Rating from './Rating'

describe('ProductImage', () => {
  it('renders generated artwork labelled with the product name when there is no photo', () => {
    render(<ProductImage product={{ name: 'Nimbus Air 14', category: 'laptops', hue: 235 }} />)
    expect(screen.getByRole('img', { name: 'Nimbus Air 14' }).tagName.toLowerCase()).toBe('svg')
  })

  it('renders every category without throwing', () => {
    const categories = ['laptops', 'phones', 'audio', 'wearables', 'gaming', 'accessories'] as const
    for (const category of categories) {
      const { unmount } = render(<ProductImage product={{ name: category, category, hue: 100 }} />)
      expect(screen.getByRole('img', { name: category })).toBeInTheDocument()
      unmount()
    }
  })

  it('prefers an uploaded photo over generated artwork', () => {
    render(<ProductImage product={{ name: 'My laptop', category: 'laptops', hue: 235, image: 'data:image/png;base64,AAAA' }} />)
    const image = screen.getByRole('img', { name: 'My laptop' })
    expect(image.tagName.toLowerCase()).toBe('img')
    expect(image).toHaveAttribute('src', 'data:image/png;base64,AAAA')
  })
})

describe('Rating', () => {
  it('describes the score and review count for assistive tech', () => {
    render(<Rating rating={4.5} reviewCount={1234} />)
    expect(screen.getByRole('img', { name: '4.5 out of 5 stars, 1,234 reviews' })).toBeInTheDocument()
  })

  it('omits the review count when none is given', () => {
    render(<Rating rating={3} />)
    expect(screen.getByRole('img', { name: '3.0 out of 5 stars' })).toBeInTheDocument()
  })
})
