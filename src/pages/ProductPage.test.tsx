import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/utils'

describe('ProductPage', () => {
  it('shows the product name, brand, price, description and key features', () => {
    renderApp('/products/nimbus-air-14')
    expect(screen.getByRole('heading', { level: 1, name: 'Nimbus Air 14' })).toBeInTheDocument()
    expect(screen.getAllByText('Nimbus').length).toBeGreaterThan(0)
    expect(screen.getByText('$1,099.00')).toBeInTheDocument()
    expect(screen.getByText(/1\.1 kg ultralight/i)).toBeInTheDocument()

    const features = screen.getByRole('region', { name: /key features/i })
    expect(within(features).getAllByRole('listitem')).toHaveLength(4)
    expect(within(features).getByText('16 GB RAM, 512 GB SSD')).toBeInTheDocument()
  })

  it('shows sale pricing with the original price and percentage off', () => {
    renderApp('/products/nimbus-pro-16')
    expect(screen.getByText('$1,899.00')).toBeInTheDocument()
    expect(screen.getByLabelText('Was $2,099.00')).toBeInTheDocument()
    expect(screen.getByText('-10%')).toBeInTheDocument()
  })

  it('shows sold-out and low-stock states', () => {
    const { unmount } = renderApp('/products/orbit-fold')
    expect(screen.getByText('Out of stock', { selector: '.stock' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled()
    unmount()

    renderApp('/products/voltix-strix-17')
    expect(screen.getByText('Only 3 left')).toBeInTheDocument()
  })

  it('shows a breadcrumb trail back to the category', () => {
    renderApp('/products/aurora-x1')
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(trail).getByRole('link', { name: 'Phones' })).toHaveAttribute('href', '/products?category=phones')
    expect(within(trail).getByText('Aurora X1')).toHaveAttribute('aria-current', 'page')
  })

  it('suggests other products from the same category but not the current one', () => {
    renderApp('/products/aurora-x1')
    const related = screen.getByRole('list', { name: 'More in Phones' })
    expect(within(related).getByRole('heading', { name: 'Aurora Lite' })).toBeInTheDocument()
    expect(within(related).queryByRole('heading', { name: 'Aurora X1' })).not.toBeInTheDocument()
    expect(within(related).queryByRole('heading', { name: 'Nimbus Air 14' })).not.toBeInTheDocument()
  })

  it('sets the page title to the product name', () => {
    renderApp('/products/kestrel-ring')
    expect(document.title).toBe('Kestrel Ring - TechCart')
  })

  it('shows a not-found message for an unknown product', () => {
    renderApp('/products/does-not-exist')
    expect(screen.getByRole('heading', { name: /product not found/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse all products/i })).toHaveAttribute('href', '/products')
  })

  it('opens from a product card', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=audio')
    await user.click(screen.getByRole('link', { name: 'Zenith Buds Pro' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Zenith Buds Pro' })).toBeInTheDocument()
  })
})
