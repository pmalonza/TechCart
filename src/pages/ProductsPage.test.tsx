import { screen, within } from '@testing-library/react'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'
import { renderApp } from '../test/utils'

describe('ProductsPage', () => {
  it('lists every product when no category is chosen', () => {
    renderApp('/products')
    expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`${PRODUCTS.length} products`)
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'page')
  })

  it('lists only the chosen category and marks its chip as current', () => {
    renderApp('/products?category=laptops')
    const laptops = PRODUCTS.filter((product) => product.category === 'laptops')

    expect(screen.getByRole('heading', { level: 1, name: 'Laptops' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`${laptops.length} products`)

    const grid = screen.getByRole('list', { name: 'Laptops' })
    for (const laptop of laptops) {
      expect(within(grid).getByRole('heading', { name: laptop.name })).toBeInTheDocument()
    }
    expect(within(grid).queryByRole('heading', { name: 'Aurora X1' })).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Laptops' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'All' })).not.toHaveAttribute('aria-current')
  })

  it('falls back to all products for an unknown category', () => {
    renderApp('/products?category=toasters')
    expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeInTheDocument()
  })

  it('offers a chip for every category', () => {
    renderApp('/products')
    const nav = screen.getByRole('navigation', { name: 'Product categories' })
    for (const category of CATEGORIES) {
      expect(within(nav).getByRole('link', { name: category.name })).toBeInTheDocument()
    }
  })

  it('shows sale pricing and stock states on cards', () => {
    renderApp('/products')
    expect(screen.getAllByText('Out of stock').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/only \d+ left/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^-\d+%$/).length).toBeGreaterThan(0)
  })
})
