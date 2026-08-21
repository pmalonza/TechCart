import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrderTrackingView from './OrderTrackingView'

function makeOrder(overrides = {}) {
  return { id: 'ORD-ABC123', status: 'received', total: 259.0, ...overrides }
}

describe('OrderTrackingView', () => {
  it('shows the order id and total', () => {
    render(<OrderTrackingView order={makeOrder()} onBack={vi.fn()} onAdvanceStatus={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'ORD-ABC123' })).toBeInTheDocument()
    expect(screen.getByText('$259.00')).toBeInTheDocument()
  })

  it('marks steps up to and including the current status as complete', () => {
    render(<OrderTrackingView order={makeOrder({ status: 'shipped' })} onBack={vi.fn()} onAdvanceStatus={vi.fn()} />)

    expect(screen.getByText('Order received')).toHaveClass('order-tracking-step-complete')
    expect(screen.getByText('Packed')).toHaveClass('order-tracking-step-complete')
    expect(screen.getByText('In transit')).toHaveClass('order-tracking-step-complete')
    expect(screen.getByText('Delivered')).not.toHaveClass('order-tracking-step-complete')
  })

  it('shows a button to advance to the next status when not yet delivered', async () => {
    const user = userEvent.setup()
    const onAdvanceStatus = vi.fn()
    render(
      <OrderTrackingView order={makeOrder({ status: 'received' })} onBack={vi.fn()} onAdvanceStatus={onAdvanceStatus} />,
    )

    await user.click(screen.getByRole('button', { name: /Simulate: mark as Packed/ }))

    expect(onAdvanceStatus).toHaveBeenCalledWith('ORD-ABC123')
  })

  it('does not show an advance button once delivered', () => {
    render(<OrderTrackingView order={makeOrder({ status: 'delivered' })} onBack={vi.fn()} onAdvanceStatus={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /Simulate/ })).not.toBeInTheDocument()
  })

  it('calls onBack when Back to orders is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<OrderTrackingView order={makeOrder()} onBack={onBack} onAdvanceStatus={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Back to orders/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
