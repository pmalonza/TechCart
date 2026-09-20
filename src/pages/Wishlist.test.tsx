import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEYS } from '../lib/storage'
import { renderApp } from '../test/utils'

const wishlistLink = () => screen.getByRole('link', { name: /^Wishlist,/ })
const cartLink = () => screen.getByRole('link', { name: /^Cart,/ })
const heart = (name: string) => screen.getByRole('button', { name: new RegExp(`(Save|Remove) ${name} (to|from) wishlist`) })

describe('wishlist toggle', () => {
  it('starts empty', () => {
    renderApp('/')
    expect(wishlistLink()).toHaveAccessibleName('Wishlist, 0 items')
  })

  it('saves and un-saves a product from its card, reflecting state with aria-pressed', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=wearables')
    const button = heart('Kestrel Ring')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)
    expect(heart('Kestrel Ring')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Remove Kestrel Ring from wishlist' })).toBeInTheDocument()
    expect(wishlistLink()).toHaveAccessibleName('Wishlist, 1 item')

    await user.click(heart('Kestrel Ring'))
    expect(heart('Kestrel Ring')).toHaveAttribute('aria-pressed', 'false')
    expect(wishlistLink()).toHaveAccessibleName('Wishlist, 0 items')
  })

  it('announces the change to screen readers', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=wearables')
    await user.click(heart('Kestrel Ring'))
    expect(screen.getByTestId('announcer')).toHaveTextContent('Kestrel Ring saved to wishlist')
  })

  it('can be toggled from the product page and stays in sync with the card', async () => {
    const user = userEvent.setup()
    renderApp('/products/pulse-watch-4')
    await user.click(screen.getByRole('button', { name: 'Save to wishlist' }))
    expect(screen.getByRole('button', { name: 'Saved to wishlist' })).toHaveAttribute('aria-pressed', 'true')
    expect(wishlistLink()).toHaveAccessibleName('Wishlist, 1 item')
  })

  it('does not open the product when the heart is clicked', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=wearables')
    await user.click(heart('Pulse Band 2'))
    expect(screen.getByRole('heading', { level: 1, name: 'Wearables' })).toBeInTheDocument()
  })
})

describe('wishlist page', () => {
  it('shows an empty state', () => {
    renderApp('/wishlist')
    expect(screen.getByRole('heading', { level: 1, name: 'Your wishlist is empty' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/products')
  })

  it('lists saved products, newest first', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=wearables')
    await user.click(heart('Pulse Band 2'))
    await user.click(heart('Kestrel Ring'))
    await user.click(wishlistLink())

    expect(screen.getByRole('heading', { level: 1, name: 'Your wishlist' })).toBeInTheDocument()
    const grid = screen.getByRole('list', { name: 'Wishlist' })
    const names = within(grid).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names).toEqual(['Kestrel Ring', 'Pulse Band 2'])
  })

  it('removes an item with its heart', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=wearables')
    await user.click(heart('Pulse Band 2'))
    await user.click(heart('Kestrel Ring'))
    await user.click(wishlistLink())

    await user.click(heart('Kestrel Ring'))
    const grid = screen.getByRole('list', { name: 'Wishlist' })
    expect(within(grid).queryByRole('heading', { name: 'Kestrel Ring' })).not.toBeInTheDocument()
    expect(within(grid).getByRole('heading', { name: 'Pulse Band 2' })).toBeInTheDocument()
  })

  it('clears everything', async () => {
    const user = userEvent.setup()
    renderApp('/products/kestrel-ring')
    await user.click(screen.getByRole('button', { name: 'Save to wishlist' }))
    await user.click(wishlistLink())
    await user.click(screen.getByRole('button', { name: 'Clear wishlist' }))
    expect(screen.getByRole('heading', { name: 'Your wishlist is empty' })).toBeInTheDocument()
  })

  it('adds every available item to the cart, skipping sold-out ones', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=phones')
    await user.click(heart('Pulse S5'))
    await user.click(heart('Aurora Lite'))
    await user.click(heart('Orbit Fold')) // sold out
    await user.click(wishlistLink())

    await user.click(screen.getByRole('button', { name: 'Add all available to cart' }))
    expect(cartLink()).toHaveAccessibleName('Cart, 2 items')
    expect(screen.getByTestId('announcer')).toHaveTextContent('2 items added to cart')
    expect(screen.getByRole('button', { name: 'Add all available to cart' })).toBeDisabled()
  })

  it('can add an item to the cart from the wishlist grid', async () => {
    const user = userEvent.setup()
    renderApp('/products/pulse-band-2')
    await user.click(screen.getByRole('button', { name: 'Save to wishlist' }))
    await user.click(wishlistLink())
    const card = screen.getByRole('heading', { name: 'Pulse Band 2' }).closest('article') as HTMLElement
    await user.click(within(card).getByRole('button', { name: /add to cart/i }))
    expect(cartLink()).toHaveAccessibleName('Cart, 1 item')
  })
})

describe('wishlist persistence', () => {
  it('survives a reload', async () => {
    const user = userEvent.setup()
    const first = renderApp('/products/kestrel-ring')
    await user.click(screen.getByRole('button', { name: 'Save to wishlist' }))
    first.unmount()

    renderApp('/')
    expect(wishlistLink()).toHaveAccessibleName('Wishlist, 1 item')
  })

  it('ignores corrupt or stale stored data', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.wishlist,
      JSON.stringify(['kestrel-ring', 'kestrel-ring', 42, 'deleted-product', null]),
    )
    renderApp('/')
    // The duplicate, the number, the null and the product that no longer exists are all ignored.
    expect(wishlistLink()).toHaveAccessibleName('Wishlist, 1 item')
  })
})
