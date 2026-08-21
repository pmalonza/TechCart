import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrderHistoryView from './OrderHistoryView'

function makeOrder(overrides = {}) {
  return { id: 'ORD-ABC123', status: 'received', total: 259.0, ...overrides }
}

describe('OrderHistoryView', () => {
  it('shows an empty state with no orders', () => {
    render(<OrderHistoryView orders={[]} onBack={vi.fn()} onTrack={vi.fn()} />)
    expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument()
  })

  it('lists orders with id, status, and total', () => {
    const order = makeOrder({ status: 'shipped', total: 268.99 })
    render(<OrderHistoryView orders={[order]} onBack={vi.fn()} onTrack={vi.fn()} />)

    expect(screen.getByText('ORD-ABC123')).toBeInTheDocument()
    expect(screen.getByText('In transit')).toBeInTheDocument()
    expect(screen.getByText('$268.99')).toBeInTheDocument()
  })

  it('calls onTrack with the order id when Track order is clicked', async () => {
    const user = userEvent.setup()
    const onTrack = vi.fn()
    render(<OrderHistoryView orders={[makeOrder()]} onBack={vi.fn()} onTrack={onTrack} />)

    await user.click(screen.getByRole('button', { name: 'Track order' }))

    expect(onTrack).toHaveBeenCalledWith('ORD-ABC123')
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<OrderHistoryView orders={[]} onBack={onBack} onTrack={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
