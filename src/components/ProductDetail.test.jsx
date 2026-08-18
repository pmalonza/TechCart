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
})
