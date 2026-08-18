import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import ProductImage from './ProductImage'
import { CATEGORIES } from '../data/categories'

describe('ProductImage', () => {
  it('renders a distinct icon for every known subcategory', () => {
    for (const category of CATEGORIES) {
      for (const sub of category.subcategories) {
        const { container, unmount } = render(<ProductImage subcategory={sub.id} />)
        expect(container.querySelector('svg')).toBeInTheDocument()
        unmount()
      }
    }
  })

  it('falls back to a default icon for an unknown subcategory', () => {
    const { container } = render(<ProductImage subcategory="made-up" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
