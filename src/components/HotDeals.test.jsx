import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HotDeals from './HotDeals'
import { getOnSaleProducts } from '../data/products'

describe('HotDeals', () => {
  it('lists every on-sale product with its original and current price', () => {
    render(<HotDeals onSelect={vi.fn()} />)

    for (const product of getOnSaleProducts()) {
      expect(screen.getByRole('button', { name: new RegExp(product.name) })).toBeInTheDocument()
    }
  })

  it('calls onSelect with the product id when a deal is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<HotDeals onSelect={onSelect} />)

    const firstDeal = getOnSaleProducts()[0]
    await user.click(screen.getByRole('button', { name: new RegExp(firstDeal.name) }))

    expect(onSelect).toHaveBeenCalledWith(firstDeal.id)
  })
})
