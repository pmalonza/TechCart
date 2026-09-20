import { screen, within } from '@testing-library/react'
import { CATEGORIES } from '../data/categories'
import { renderApp } from '../test/utils'

describe('HomePage', () => {
  it('links to a product listing for every category', () => {
    renderApp('/')
    const section = screen.getByRole('region', { name: /shop by category/i })
    for (const category of CATEGORIES) {
      const link = within(section).getByRole('link', { name: new RegExp(category.name) })
      expect(link).toHaveAttribute('href', `/products?category=${category.id}`)
    }
  })

  it('shows the four top-rated products', () => {
    renderApp('/')
    const grid = screen.getByRole('list', { name: 'Top rated products' })
    expect(within(grid).getAllByRole('listitem')).toHaveLength(4)
    expect(within(grid).getByRole('heading', { name: 'Nimbus Pro 16' })).toBeInTheDocument()
    expect(within(grid).getByRole('heading', { name: 'Zenith Studio Over-Ear' })).toBeInTheDocument()
  })

  it('has a call to action into the full catalog', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /shop all products/i })).toHaveAttribute('href', '/products')
  })
})
