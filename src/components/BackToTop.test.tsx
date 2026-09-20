import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BACK_TO_TOP_THRESHOLD } from '../lib/scroll'
import { renderApp } from '../test/utils'
import BackToTop, { PAGE_TOP_ID } from './BackToTop'

/** Pretends the page was scrolled to `y` and lets the component react to it. */
async function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
  await act(async () => {
    fireEvent.scroll(window)
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)))
  })
}

const button = () => screen.queryByRole('button', { name: 'Back to top' })

describe('BackToTop', () => {
  afterEach(async () => {
    await scrollTo(0)
    vi.restoreAllMocks()
  })

  it('is not on the page when it is at the top', () => {
    render(<BackToTop />)
    expect(button()).not.toBeInTheDocument()
  })

  it('appears after scrolling past the threshold and goes away again at the top', async () => {
    render(<BackToTop />)
    await scrollTo(BACK_TO_TOP_THRESHOLD)
    expect(button()).not.toBeInTheDocument()

    await scrollTo(BACK_TO_TOP_THRESHOLD + 1)
    expect(button()).toBeInTheDocument()

    await scrollTo(0)
    expect(button()).not.toBeInTheDocument()
  })

  it('shows immediately when the page loads already scrolled down (for example after a reload)', () => {
    Object.defineProperty(window, 'scrollY', { value: 900, configurable: true, writable: true })
    render(<BackToTop />)
    expect(button()).toBeInTheDocument()
  })

  it('is a real button with an accessible name and a hidden icon', async () => {
    render(<BackToTop />)
    await scrollTo(800)
    const back = screen.getByRole('button', { name: 'Back to top' })
    expect(back).toHaveAttribute('type', 'button')
    expect(back.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('scrolls to the top when clicked', async () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<BackToTop />)
    await scrollTo(800)

    await user.click(screen.getByRole('button', { name: 'Back to top' }))
    expect(scroll).toHaveBeenCalledWith({ top: 0 })
  })

  it('can be used from the keyboard', async () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<BackToTop />)
    await scrollTo(800)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Back to top' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(scroll).toHaveBeenCalledWith({ top: 0 })
  })

  it('listens passively and stops listening when it is removed', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<BackToTop />)

    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

describe('BackToTop in the app', () => {
  afterEach(async () => {
    await scrollTo(0)
    vi.restoreAllMocks()
  })

  it('is available on every page and moves focus to the top of the page when used', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const user = userEvent.setup()
    renderApp('/help')
    expect(button()).not.toBeInTheDocument()

    await scrollTo(1200)
    await user.click(screen.getByRole('button', { name: 'Back to top' }))

    const top = document.getElementById(PAGE_TOP_ID)!
    expect(top).toHaveFocus()
    // The marker comes before the skip link, so the next Tab stop is still "Skip to content".
    await user.tab()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus()
  })

  it('appears on a product page too', async () => {
    renderApp('/products/nimbus-air-14')
    await scrollTo(700)
    expect(button()).toBeInTheDocument()
  })
})
