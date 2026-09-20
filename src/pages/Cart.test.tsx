import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { STORAGE_KEYS } from '../lib/storage'
import { renderApp } from '../test/utils'

const cartLink = () => screen.getByRole('link', { name: /^Cart,/ })
const purchase = () => within(screen.getByRole('group', { name: 'Purchase options' }))
const productCard = (name: string) => screen.getByRole('heading', { name }).closest('article') as HTMLElement

describe('cart: adding items', () => {
  it('starts empty', () => {
    renderApp('/')
    expect(cartLink()).toHaveAccessibleName('Cart, 0 items')
  })

  it('adds a product from its card and updates the header count', async () => {
    const user = userEvent.setup()
    renderApp('/products?category=audio')
    await user.click(within(productCard('Zenith Buds Pro')).getByRole('button', { name: /add to cart/i }))
    expect(cartLink()).toHaveAccessibleName('Cart, 1 item')

    await user.click(within(productCard('Zenith Buds Pro')).getByRole('button', { name: /add to cart|added to cart/i }))
    expect(cartLink()).toHaveAccessibleName('Cart, 2 items')
  })

  it('adds several at once from the product page', async () => {
    const user = userEvent.setup()
    renderApp('/products/lumen-usbc-hub')
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Lumen USB-C Hub 8-in-1' }))
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Lumen USB-C Hub 8-in-1' }))
    await user.click(purchase().getByRole('button', { name: /add to cart/i }))

    expect(cartLink()).toHaveAccessibleName('Cart, 3 items')
    expect(screen.getByText(/3 in your cart/i)).toBeInTheDocument()
  })

  it('does not let you add a sold-out product', () => {
    renderApp('/products/orbit-fold')
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled()
  })

  it('stops at the available stock', async () => {
    const user = userEvent.setup()
    renderApp('/products/voltix-strix-17') // only 3 in stock
    const increase = screen.getByRole('button', { name: 'Increase quantity of Voltix Strix 17' })
    await user.click(increase)
    await user.click(increase)
    expect(increase).toBeDisabled()
    await user.click(purchase().getByRole('button', { name: /add to cart/i }))

    expect(cartLink()).toHaveAccessibleName('Cart, 3 items')
    expect(purchase().getByRole('button', { name: 'Maximum in cart' })).toBeDisabled()
  })

  it('caps a typed quantity at the stock level', async () => {
    const user = userEvent.setup()
    renderApp('/products/voltix-strix-17')
    const box = screen.getByRole('textbox', { name: 'Quantity of Voltix Strix 17' })
    await user.clear(box)
    await user.type(box, '99')
    await user.tab()
    expect(box).toHaveValue('3')
  })

  it('restores a sensible quantity when the box is left empty', async () => {
    const user = userEvent.setup()
    renderApp('/products/lumen-usbc-hub')
    const box = screen.getByRole('textbox', { name: 'Quantity of Lumen USB-C Hub 8-in-1' })
    await user.clear(box)
    await user.tab()
    expect(box).toHaveValue('1')
  })
})

describe('cart page', () => {
  it('shows an empty state with a way to start shopping', () => {
    renderApp('/cart')
    expect(screen.getByRole('heading', { level: 1, name: 'Your cart is empty' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start shopping' })).toHaveAttribute('href', '/products')
  })

  async function fillCart() {
    const user = userEvent.setup()
    renderApp('/products')
    await user.click(within(productCard('Nimbus Pro 16')).getByRole('button', { name: /add to cart/i }))
    await user.click(within(productCard('Lumen USB-C Hub 8-in-1')).getByRole('button', { name: /add to cart/i }))
    await user.click(within(productCard('Lumen USB-C Hub 8-in-1')).getByRole('button', { name: /add to cart|added to cart/i }))
    await user.click(cartLink())
    return user
  }

  it('lists the items with line totals and an order summary', async () => {
    await fillCart()
    expect(screen.getByRole('heading', { level: 1, name: 'Your cart' })).toBeInTheDocument()
    const lines = within(screen.getByRole('list', { name: 'Items in your cart' })).getAllByRole('listitem')
    expect(lines).toHaveLength(2)

    // 1 x $1,899.00 + 2 x $49.00 = $1,997.00; the Pro 16 is $200 off its original price.
    expect(within(lines[0]).getByText('$1,899.00', { selector: '.cart-line-total' })).toBeInTheDocument()
    expect(within(lines[1]).getByText('$98.00', { selector: '.cart-line-total' })).toBeInTheDocument()
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(summary).getByText('$1,997.00')).toBeInTheDocument()
    expect(within(summary).getByText('$200.00')).toBeInTheDocument()
    expect(within(summary).getByText(/subtotal \(3 items\)/i)).toBeInTheDocument()
  })

  it('changes a quantity with the stepper and updates the totals', async () => {
    const user = await fillCart()
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Lumen USB-C Hub 8-in-1' }))
    expect(screen.getByText('$147.00', { selector: '.cart-line-total' })).toBeInTheDocument()
    expect(cartLink()).toHaveAccessibleName('Cart, 4 items')

    await user.click(screen.getByRole('button', { name: 'Decrease quantity of Lumen USB-C Hub 8-in-1' }))
    await user.click(screen.getByRole('button', { name: 'Decrease quantity of Lumen USB-C Hub 8-in-1' }))
    expect(screen.getByText('$49.00', { selector: '.cart-line-total' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decrease quantity of Lumen USB-C Hub 8-in-1' })).toBeDisabled()
  })

  it('removes a line', async () => {
    const user = await fillCart()
    await user.click(screen.getByRole('button', { name: /remove lumen usb-c hub 8-in-1 from cart/i }))
    expect(screen.queryByRole('link', { name: 'Lumen USB-C Hub 8-in-1' })).not.toBeInTheDocument()
    expect(cartLink()).toHaveAccessibleName('Cart, 1 item')
  })

  it('removing the last line shows the empty state', async () => {
    const user = userEvent.setup()
    renderApp('/products/pulse-s5')
    await user.click(purchase().getByRole('button', { name: /add to cart/i }))
    await user.click(cartLink())
    await user.click(screen.getByRole('button', { name: /remove pulse s5 from cart/i }))
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument()
  })

  it('empties the whole cart', async () => {
    const user = await fillCart()
    await user.click(screen.getByRole('button', { name: 'Empty cart' }))
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument()
    expect(cartLink()).toHaveAccessibleName('Cart, 0 items')
  })

  it('caps a quantity at stock and flags it', async () => {
    const user = userEvent.setup()
    renderApp('/products/voltix-strix-17')
    const box = screen.getByRole('textbox', { name: 'Quantity of Voltix Strix 17' })
    await user.clear(box)
    await user.type(box, '3')
    await user.tab()
    await user.click(purchase().getByRole('button', { name: /add to cart/i }))
    await user.click(cartLink())
    expect(screen.getByText(/maximum quantity for this item/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase quantity of Voltix Strix 17' })).toBeDisabled()
  })
})

describe('cart persistence', () => {
  it('survives a reload', async () => {
    const user = userEvent.setup()
    const first = renderApp('/products/pulse-band-2')
    await user.click(purchase().getByRole('button', { name: /add to cart/i }))
    expect(cartLink()).toHaveAccessibleName('Cart, 1 item')
    first.unmount()

    renderApp('/')
    expect(cartLink()).toHaveAccessibleName('Cart, 1 item')
  })

  it('ignores corrupt stored data instead of crashing', () => {
    window.localStorage.setItem(STORAGE_KEYS.cart, '{not json')
    renderApp('/cart')
    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument()
  })

  it('cleans up bad stored lines and unknown products', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.cart,
      JSON.stringify([
        { productId: 'pulse-s5', quantity: 2 },
        { productId: 'no-such-product', quantity: 1 },
        { productId: 'pulse-band-2', quantity: -5 },
        'junk',
      ]),
    )
    renderApp('/')
    expect(cartLink()).toHaveAccessibleName('Cart, 2 items')
  })

  it('stays in sync with changes made in another tab', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(cartLink()).toHaveAccessibleName('Cart, 0 items')

    const value = JSON.stringify([{ productId: 'pulse-s5', quantity: 3 }])
    window.localStorage.setItem(STORAGE_KEYS.cart, value)
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.cart, newValue: value }))
    expect(await screen.findByRole('link', { name: 'Cart, 3 items' })).toBeInTheDocument()
  })
})
