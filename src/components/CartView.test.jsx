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

describe('CartView', () => {
  it('shows an empty state with no items', () => {
    render(<CartView items={[]} onUpdateQuantity={vi.fn()} onRemove={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('lists items with variant, price, and subtotal', () => {
    const item = makeItem({ quantity: 2 })
    render(<CartView items={[item]} onUpdateQuantity={vi.fn()} onRemove={vi.fn()} onBack={vi.fn()} />)

    expect(screen.getByText('CompactCool Mini Fridge')).toBeInTheDocument()
    expect(screen.getByText('White')).toBeInTheDocument()
    expect(screen.getByText('Total: $259.00')).toBeInTheDocument()
  })

  it('calls onUpdateQuantity when the quantity input changes', async () => {
    const user = userEvent.setup()
    const onUpdateQuantity = vi.fn()
    const item = makeItem()
    render(
      <CartView items={[item]} onUpdateQuantity={onUpdateQuantity} onRemove={vi.fn()} onBack={vi.fn()} />,
    )

    const qtyInput = screen.getByLabelText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '3')

    expect(onUpdateQuantity).toHaveBeenLastCalledWith('ref-3::white::', 3)
  })

  it('clamps the quantity to at least 1 when the field is left empty on blur', async () => {
    const user = userEvent.setup()
    const onUpdateQuantity = vi.fn()
    const item = makeItem()
    render(
      <CartView items={[item]} onUpdateQuantity={onUpdateQuantity} onRemove={vi.fn()} onBack={vi.fn()} />,
    )

    const qtyInput = screen.getByLabelText('Qty')
    await user.clear(qtyInput)
    await user.tab()

    expect(onUpdateQuantity).toHaveBeenLastCalledWith('ref-3::white::', 1)
    expect(qtyInput).toHaveValue(1)
  })

  it('calls onRemove when Remove is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const item = makeItem()
    render(<CartView items={[item]} onUpdateQuantity={vi.fn()} onRemove={onRemove} onBack={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(onRemove).toHaveBeenCalledWith('ref-3::white::')
  })

  it('calls onBack when Continue shopping is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<CartView items={[]} onUpdateQuantity={vi.fn()} onRemove={vi.fn()} onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: /Continue shopping/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
