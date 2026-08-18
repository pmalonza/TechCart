import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetail from './ProductDetail'
import { getProduct } from '../data/products'

describe('ProductDetail', () => {
  const product = getProduct('ref-1')

  it('shows the product name, description, price, and breadcrumb', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument()
    expect(screen.getByText(product.description)).toBeInTheDocument()
    expect(screen.getByText('$649.99')).toBeInTheDocument()
    expect(screen.getByText('Electronics › Refrigerators')).toBeInTheDocument()
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<ProductDetail product={product} onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: /Back to products/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('defaults to the first color and updates the label on selection', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={product} onBack={vi.fn()} />)

    expect(screen.getByText('Color: White')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Black' }))

    expect(screen.getByText('Color: Black')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Black' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'White' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not show a color group for a product with only one color', () => {
    const singleColorProduct = getProduct('tv-1')
    render(<ProductDetail product={singleColorProduct} onBack={vi.fn()} />)

    expect(screen.queryByText(/^Color:/)).not.toBeInTheDocument()
  })

  it('shows size options for a product that has them, defaulting to the first', async () => {
    const user = userEvent.setup()
    const monitor = getProduct('cacc-3')
    render(<ProductDetail product={monitor} onBack={vi.fn()} />)

    expect(screen.getByRole('button', { name: '24"' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: '32"' }))

    expect(screen.getByRole('button', { name: '32"' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '24"' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not show a size group for a product with no sizes', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} />)
    expect(screen.queryByText('Size')).not.toBeInTheDocument()
  })
})
