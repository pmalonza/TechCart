import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PRODUCTS } from '../data/products'
import { renderApp } from '../test/utils'

/** Product names currently shown in the results grid, in order. */
function shownNames(listName = 'All products') {
  const grid = screen.getByRole('list', { name: listName })
  return within(grid)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)
}

const status = () => screen.getByRole('status')

describe('product filters', () => {
  it('filters by brand and shows a removable chip', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('checkbox', { name: /^Nimbus/ }))

    expect(shownNames()).toEqual(['Nimbus Air 14', 'Nimbus Pro 16', 'Nimbus Laptop Sleeve 14'])
    expect(status()).toHaveTextContent('3 products')
    const chips = screen.getByRole('list', { name: 'Active filters' })
    expect(within(chips).getByText('Nimbus')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove filter: Nimbus' }))
    expect(status()).toHaveTextContent(`${PRODUCTS.length} products`)
    expect(screen.queryByRole('list', { name: 'Active filters' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /^Nimbus/ })).not.toBeChecked()
  })

  it('allows several brands at once', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('checkbox', { name: /^Zenith/ }))
    await user.click(screen.getByRole('checkbox', { name: /^Lumen/ }))
    expect(status()).toHaveTextContent('5 products')
  })

  it('shows brand counts for the current category', () => {
    renderApp('/products?category=laptops')
    expect(screen.getByRole('checkbox', { name: /^Nimbus\s*2$/ })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /^Zenith/ })).not.toBeInTheDocument()
  })

  it('filters by price range', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.type(screen.getByLabelText('Min ($)'), '59')
    await user.type(screen.getByLabelText('Max ($)'), '79')
    await user.click(screen.getByRole('button', { name: 'Apply price' }))

    expect(shownNames().sort()).toEqual(['Lumen Beam Speaker', 'Pulse Band 2', 'Voltix Pad Pro'])
    expect(screen.getByText('$59.00 - $79.00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Remove filter: \$59\.00/ }))
    expect(status()).toHaveTextContent(`${PRODUCTS.length} products`)
    expect(screen.getByLabelText('Min ($)')).toHaveValue(null)
  })

  it('applies the price range on Enter', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.type(screen.getByLabelText('Max ($)'), '30{Enter}')
    expect(shownNames()).toEqual(['Nimbus Laptop Sleeve 14'])
    expect(screen.getByText('Up to $30.00')).toBeInTheDocument()
  })

  it('filters by minimum rating', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('radio', { name: '4 stars & up' }))
    const names = shownNames()
    expect(names.length).toBeGreaterThan(0)
    expect(names.length).toBeLessThan(PRODUCTS.length)
    const byName = new Map(PRODUCTS.map((product) => [product.name, product]))
    expect(names.every((name) => byName.get(name!)!.rating >= 4)).toBe(true)

    await user.click(screen.getByRole('radio', { name: 'Any rating' }))
    expect(status()).toHaveTextContent(`${PRODUCTS.length} products`)
  })

  it('hides sold-out products with "In stock only"', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    expect(shownNames()).toContain('Orbit Fold')
    await user.click(screen.getByRole('checkbox', { name: 'In stock only' }))
    expect(shownNames()).not.toContain('Orbit Fold')
    expect(status()).toHaveTextContent(`${PRODUCTS.length - 1} products`)
  })

  it('shows only discounted products with "On sale"', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('checkbox', { name: 'On sale' }))
    expect(shownNames().sort()).toEqual(['Nimbus Pro 16', 'Orbit Fold', 'Voltix Console X', 'Zenith Studio Over-Ear'])
  })

  it('combines filters, then clears them all at once', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('checkbox', { name: 'On sale' }))
    await user.click(screen.getByRole('checkbox', { name: 'In stock only' }))
    await user.click(screen.getByRole('checkbox', { name: /^Zenith/ }))
    expect(shownNames()).toEqual(['Zenith Studio Over-Ear'])

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }))
    expect(status()).toHaveTextContent(`${PRODUCTS.length} products`)
    expect(screen.getByRole('checkbox', { name: 'On sale' })).not.toBeChecked()
  })

  it('explains when nothing matches and offers a reset', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('checkbox', { name: /^Zenith/ }))
    await user.type(screen.getByLabelText('Max ($)'), '10{Enter}')

    expect(screen.getByRole('heading', { name: /no products match these filters/i })).toBeInTheDocument()
    expect(status()).toHaveTextContent('0 products')
    await user.click(within(screen.getByRole('main')).getAllByRole('button', { name: 'Clear all filters' }).at(-1)!)
    expect(status()).toHaveTextContent(`${PRODUCTS.length} products`)
  })

  it('reads filters and sort order from the URL', () => {
    renderApp('/products?brand=Nimbus&sort=price-desc')
    expect(shownNames()).toEqual(['Nimbus Pro 16', 'Nimbus Air 14', 'Nimbus Laptop Sleeve 14'])
    expect(screen.getByRole('checkbox', { name: /^Nimbus/ })).toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('price-desc')
  })

  it('narrows a search with filters', async () => {
    const user = userEvent.setup()
    renderApp('/products?q=wireless')
    await user.click(screen.getByRole('checkbox', { name: 'In stock only' }))
    expect(status()).toHaveTextContent(/results?$/)
    expect(shownNames("Results for “wireless”").length).toBeGreaterThan(0)
  })

  it('toggles the mobile filters panel button', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    const toggle = screen.getByRole('button', { name: /^Filters$/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('counts active filters on the toggle button', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(screen.getByRole('checkbox', { name: 'On sale' }))
    expect(screen.getByRole('button', { name: 'Filters (1)' })).toBeInTheDocument()
  })
})

describe('sorting', () => {
  it('sorts by price, low to high', async () => {
    const user = userEvent.setup()
    renderApp('/products')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price-asc')
    const names = shownNames()
    expect(names[0]).toBe('Nimbus Laptop Sleeve 14')
    expect(names.at(-1)).toBe('Nimbus Pro 16')
  })

  it('sorts by price, high to low, and keeps active filters', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=phones')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price-desc')
    expect(shownNames('Phones')).toEqual(['Orbit Fold', 'Aurora X1', 'Aurora Lite', 'Pulse S5'])
  })

  it('offers "Best match" instead of "Featured" when searching', () => {
    renderApp('/products?q=nimbus')
    expect(screen.getByRole('option', { name: 'Best match' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Featured' })).not.toBeInTheDocument()
  })

  it('offers "Featured" as the default order when browsing', () => {
    renderApp('/products')
    expect(screen.getByRole('option', { name: 'Featured' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('relevance')
  })
})
