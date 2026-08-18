import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutView from './CheckoutView'
import { getProduct } from '../data/products'

function makeItem(overrides = {}) {
  const product = getProduct('ref-3')
  return {
    variantId: 'ref-3::white::',
    productId: 'ref-3',
    colorId: 'white',
    colorLabel: 'White',
    size: null,
    quantity: 2,
    product,
    ...overrides,
  }
}

describe('CheckoutView', () => {
  it('lists items with quantity and shows the total', () => {
    render(<CheckoutView items={[makeItem()]} onBack={vi.fn()} onPlaceOrder={vi.fn()} />)

    expect(screen.getByText(/CompactCool Mini Fridge \(White\) × 2/)).toBeInTheDocument()
    expect(screen.getByText('Total: $259.00')).toBeInTheDocument()
  })

  it('calls onBack when Back to cart is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<CheckoutView items={[makeItem()]} onBack={onBack} onPlaceOrder={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Back to cart/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onPlaceOrder when Place order is clicked', async () => {
    const user = userEvent.setup()
    const onPlaceOrder = vi.fn()
    render(<CheckoutView items={[makeItem()]} onBack={vi.fn()} onPlaceOrder={onPlaceOrder} />)

    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(onPlaceOrder).toHaveBeenCalledTimes(1)
  })
})
