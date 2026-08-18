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
    address: { street: '123 Main St', city: 'Springfield', postalCode: '12345' },
    paymentMethod: 'paypal',
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

  it('shows the delivery address and payment method', () => {
    render(<OrderConfirmation order={makeOrder()} onContinueShopping={vi.fn()} />)

    expect(screen.getByText('Shipping to 123 Main St, Springfield 12345')).toBeInTheDocument()
    expect(screen.getByText('Payment method: PayPal')).toBeInTheDocument()
  })

  it('shows the bank transfer label when that method was selected', () => {
    render(
      <OrderConfirmation order={makeOrder({ paymentMethod: 'bank' })} onContinueShopping={vi.fn()} />,
    )

    expect(screen.getByText('Payment method: Bank transfer')).toBeInTheDocument()
  })

  it('calls onContinueShopping when clicked', async () => {
    const user = userEvent.setup()
    const onContinueShopping = vi.fn()
    render(<OrderConfirmation order={makeOrder()} onContinueShopping={onContinueShopping} />)

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }))

    expect(onContinueShopping).toHaveBeenCalledTimes(1)
  })
})
