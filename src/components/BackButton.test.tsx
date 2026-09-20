import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/utils'

describe('BackButton', () => {
  it('goes back to the previous page in the visit', async () => {
    const user = userEvent.setup()
    renderApp(['/', '/products/aurora-x1'])
    expect(screen.getByRole('heading', { level: 1, name: 'Aurora X1' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: /gadgets you will actually use/i })).toBeInTheDocument()
  })

  it('returns to the exact listing you came from, filters and all', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=audio&sort=price-desc')
    await user.click(screen.getByRole('link', { name: 'Zenith Buds Pro' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Zenith Buds Pro' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Audio' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('price-desc')
  })

  it('goes to a sensible fallback when the visit started on this page', async () => {
    const user = userEvent.setup()
    renderApp('/products/aurora-x1')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Phones' })).toBeInTheDocument()
  })

  it('appears on a category or search listing, and falls back to all products', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=gaming')
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeInTheDocument()
  })

  it('is not shown on the unfiltered listing, where there is nothing to go back out of', () => {
    renderApp('/products')
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })
})
