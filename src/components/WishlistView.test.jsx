import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WishlistView from './WishlistView'
import { getProduct } from '../data/products'

describe('WishlistView', () => {
  it('shows an empty state with no items', () => {
    render(<WishlistView items={[]} onBack={vi.fn()} onSelect={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText('Your wishlist is empty.')).toBeInTheDocument()
  })

  it('lists wishlisted products with name and price', () => {
    const product = getProduct('tv-1')
    render(<WishlistView items={[product]} onBack={vi.fn()} onSelect={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByText(product.name)).toBeInTheDocument()
    expect(screen.getByText('$549.99')).toBeInTheDocument()
  })

  it('calls onSelect with the product id when a wishlist item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const product = getProduct('tv-1')
    render(<WishlistView items={[product]} onBack={vi.fn()} onSelect={onSelect} onRemove={vi.fn()} />)

    await user.click(screen.getByText(product.name))

    expect(onSelect).toHaveBeenCalledWith('tv-1')
  })

  it('calls onRemove with the product id when Remove is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const product = getProduct('tv-1')
    render(<WishlistView items={[product]} onBack={vi.fn()} onSelect={vi.fn()} onRemove={onRemove} />)

    await user.click(screen.getByRole('button', { name: `Remove ${product.name} from wishlist` }))

    expect(onRemove).toHaveBeenCalledWith('tv-1')
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<WishlistView items={[]} onBack={onBack} onSelect={vi.fn()} onRemove={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
