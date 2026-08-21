import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScrollTopBottomButton from './ScrollTopBottomButton'

describe('ScrollTopBottomButton', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  it('shows a scroll-to-bottom button near the top of the page', () => {
    render(<ScrollTopBottomButton />)
    expect(screen.getByRole('button', { name: 'Scroll to bottom' })).toBeInTheDocument()
  })

  it('scrolls to the bottom when clicked near the top', async () => {
    const user = userEvent.setup()
    render(<ScrollTopBottomButton />)

    await user.click(screen.getByRole('button', { name: 'Scroll to bottom' }))

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    )
  })

  it('switches to a scroll-to-top button after scrolling down', () => {
    render(<ScrollTopBottomButton />)

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
    fireEvent.scroll(window)

    expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument()
  })

  it('scrolls to the top when clicked after scrolling down', async () => {
    const user = userEvent.setup()
    render(<ScrollTopBottomButton />)

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
    fireEvent.scroll(window)
    await user.click(screen.getByRole('button', { name: 'Scroll to top' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
