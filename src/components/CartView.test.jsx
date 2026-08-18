import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartView from './CartView'
import { getProduct } from '../data/products'

function makeItem(overrides = {}) {
  const product = getProduct('ref-3')
  return {
    variantId: 'ref-3::white::',
    productId: 'ref-3',
    colorId: 'white',
    colorLabel: 'White',
    size: null,
    quantity: 1,
    product,
    ...overrides,
  }
}

function renderCartView(overrides = {}) {
  const items = overrides.items ?? []
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const props = {
    items,
    onUpdateQuantity: vi.fn(),
    onRemove: vi.fn(),
    onBack: vi.fn(),
    onCheckout: vi.fn(),
    subtotal,
    discount: null,
    discountAmount: 0,
    total: subtotal,
    onApplyDiscount: vi.fn(() => ({ ok: true })),
    onRemoveDiscount: vi.fn(),
    ...overrides,
  }
  render(<CartView {...props} />)
  return props
}

describe('CartView', () => {
  it('shows an empty state with no items', () => {
    renderCartView()
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('does not show a checkout button with an empty cart', () => {
    renderCartView()
    expect(screen.queryByRole('button', { name: 'Checkout' })).not.toBeInTheDocument()
  })

  it('lists items with variant, price, and total', () => {
    const item = makeItem({ quantity: 2 })
    renderCartView({ items: [item] })

    expect(screen.getByText('CompactCool Mini Fridge')).toBeInTheDocument()
    expect(screen.getByText('White')).toBeInTheDocument()
    expect(screen.getByText('Subtotal: $259.00')).toBeInTheDocument()
    expect(screen.getByText('Total: $259.00')).toBeInTheDocument()
  })

  it('shows the discounted total and the applied code', () => {
    const item = makeItem({ quantity: 2 })
    renderCartView({
      items: [item],
      discount: { code: 'SAVE10', type: 'percent', value: 10 },
      discountAmount: 25.9,
      total: 233.1,
    })

    expect(screen.getByText('Subtotal: $259.00')).toBeInTheDocument()
    expect(screen.getByText('Code SAVE10 applied: -$25.90')).toBeInTheDocument()
    expect(screen.getByText('Total: $233.10')).toBeInTheDocument()
  })

  it('calls onUpdateQuantity when the quantity input changes', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    const { onUpdateQuantity } = renderCartView({ items: [item] })

    const qtyInput = screen.getByLabelText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '3')

    expect(onUpdateQuantity).toHaveBeenLastCalledWith('ref-3::white::', 3)
  })

  it('clamps the quantity to at least 1 when the field is left empty on blur', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    const { onUpdateQuantity } = renderCartView({ items: [item] })

    const qtyInput = screen.getByLabelText('Qty')
    await user.clear(qtyInput)
    await user.tab()

    expect(onUpdateQuantity).toHaveBeenLastCalledWith('ref-3::white::', 1)
    expect(qtyInput).toHaveValue(1)
  })

  it('calls onRemove when Remove is clicked', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    const { onRemove } = renderCartView({ items: [item] })

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(onRemove).toHaveBeenCalledWith('ref-3::white::')
  })

  it('calls onBack when Continue shopping is clicked', async () => {
    const user = userEvent.setup()
    const { onBack } = renderCartView()

    await user.click(screen.getByRole('button', { name: /Continue shopping/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onCheckout when Checkout is clicked', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    const { onCheckout } = renderCartView({ items: [item] })

    await user.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(onCheckout).toHaveBeenCalledTimes(1)
  })

  it('calls onApplyDiscount with the entered code', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    const { onApplyDiscount } = renderCartView({ items: [item] })

    await user.type(screen.getByLabelText('Discount code'), 'SAVE10')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApplyDiscount).toHaveBeenCalledWith('SAVE10')
  })

  it('shows an error when the discount code is invalid', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    renderCartView({
      items: [item],
      onApplyDiscount: vi.fn(() => ({ ok: false, message: 'Invalid discount code.' })),
    })

    await user.type(screen.getByLabelText('Discount code'), 'NOPE')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid discount code.')
  })

  it('calls onRemoveDiscount when Remove is clicked on an applied discount', async () => {
    const user = userEvent.setup()
    const item = makeItem()
    const { onRemoveDiscount } = renderCartView({
      items: [item],
      discount: { code: 'SAVE10', type: 'percent', value: 10 },
      discountAmount: 25.9,
      total: 233.1,
    })

    await user.click(screen.getByRole('button', { name: 'Remove discount code' }))

    expect(onRemoveDiscount).toHaveBeenCalledTimes(1)
  })
})
