import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrderConfirmation from './OrderConfirmation'
import { getProduct } from '../data/products'

function makeOrder(overrides = {}) {
  const product = getProduct('ref-3')
  return {
    id: 'ORD-TEST123',
    items: [
      {
        variantId: 'ref-3::white::',
        productId: 'ref-3',
        colorId: 'white',
        colorLabel: 'White',
        size: null,
        quantity: 2,
        product,
      },
    ],
    total: 259.0,
    ...overrides,
  }
}

describe('OrderConfirmation', () => {
  it('shows the order id, items, and total', () => {
    render(<OrderConfirmation order={makeOrder()} onContinueShopping={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Order ORD-TEST123 placed. Thank you!')
    expect(screen.getByText(/CompactCool Mini Fridge \(White\) × 2/)).toBeInTheDocument()
    expect(screen.getByText('Total: $259.00')).toBeInTheDocument()
  })

  it('calls onContinueShopping when clicked', async () => {
    const user = userEvent.setup()
    const onContinueShopping = vi.fn()
    render(<OrderConfirmation order={makeOrder()} onContinueShopping={onContinueShopping} />)

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }))

    expect(onContinueShopping).toHaveBeenCalledTimes(1)
  })
})
