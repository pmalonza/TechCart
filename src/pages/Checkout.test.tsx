import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CartLine } from '../lib/cart'
import { STORAGE_KEYS } from '../lib/storage'
import { ADA, registerAndLand, type UserSession } from '../test/auth'
import { renderApp } from '../test/utils'

const seedCart = (lines: CartLine[]) => window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines))
const storedOrders = () => JSON.parse(window.localStorage.getItem(STORAGE_KEYS.orders) ?? '[]')
const cartLink = () => screen.getByRole('link', { name: /^Cart,/ })
const placeOrderButton = () => screen.getByRole('button', { name: /^Place order/ })

const NAIROBI = {
  'Full name': 'Grace Hopper',
  'Phone number': '+254 700 111 222',
  'Street address': '1 Kimathi Street',
  'City or town': 'Nairobi',
  'Postal code': '00100',
}

async function fillDeliveryAddress(user: UserSession, fields: Record<string, string> = NAIROBI) {
  const section = within(screen.getByRole('region', { name: 'Delivery address' }))
  await user.selectOptions(section.getByLabelText('Country'), 'KE')
  for (const [label, value] of Object.entries(fields)) {
    const box = section.getByLabelText(label)
    await user.clear(box)
    await user.type(box, value)
  }
}

async function fillCard(user: UserSession, number = '4242 4242 4242 4242') {
  await user.type(screen.getByLabelText('Card number'), number)
  await user.type(screen.getByLabelText('Name on card'), 'Grace Hopper')
  await user.type(screen.getByLabelText('Expiry date'), '1228')
  await user.type(screen.getByLabelText('Security code'), '123')
}

/** Fills a complete guest checkout and leaves it ready to submit. */
async function completeGuestForm(user: UserSession) {
  await user.type(screen.getByLabelText('Email'), 'grace@example.com')
  await fillDeliveryAddress(user)
  await fillCard(user)
}

describe('checkout access', () => {
  it('sends an empty cart back to the cart', () => {
    renderApp('/checkout')
    expect(screen.getByRole('heading', { level: 1, name: 'Your cart is empty' })).toBeInTheDocument()
  })

  it('is reached from the cart page', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/cart')
    await user.click(screen.getByRole('link', { name: 'Proceed to checkout' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Checkout' })).toBeInTheDocument()
  })

  it('warns that it is a demo and never asks for a real card', () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    renderApp('/checkout')
    expect(screen.getByRole('note')).toHaveTextContent(/demo checkout/i)
    expect(screen.getByRole('note')).toHaveTextContent(/do not enter a real card/i)
  })
})

describe('order summary', () => {
  it('itemises subtotal, delivery, tax and total', () => {
    seedCart([{ productId: 'nimbus-laptop-sleeve-14', quantity: 1 }]) // $29.00
    renderApp('/checkout')
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(summary).getByText('Nimbus Laptop Sleeve 14')).toBeInTheDocument()
    expect(within(summary).getByText('$4.99')).toBeInTheDocument() // standard delivery below $100
    expect(within(summary).getByText('$2.32')).toBeInTheDocument() // 8% of $29.00
    expect(within(summary).getByText('$36.31')).toBeInTheDocument() // 29.00 + 4.99 + 2.32
    expect(placeOrderButton()).toHaveTextContent('$36.31')
  })

  it('makes standard delivery free once the order reaches $100', () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }]) // $249.00
    renderApp('/checkout')
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(summary).getByText('Free')).toBeInTheDocument()
    expect(within(summary).queryByText(/more for free standard delivery/i)).not.toBeInTheDocument()
  })

  it('nudges towards free delivery when below the threshold', () => {
    seedCart([{ productId: 'nimbus-laptop-sleeve-14', quantity: 1 }])
    renderApp('/checkout')
    expect(screen.getByText(/add \$71\.00 more for free standard delivery/i)).toBeInTheDocument()
  })

  it('recalculates when express delivery is chosen', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }]) // $249.00 -> tax $19.92
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.click(screen.getByRole('radio', { name: /express delivery/i }))
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(summary).getByText('$14.99')).toBeInTheDocument()
    expect(within(summary).getByText('$283.91')).toBeInTheDocument() // 249.00 + 14.99 + 19.92
  })

  it('reports quantities that were lowered for stock', () => {
    seedCart([{ productId: 'voltix-strix-17', quantity: 9 }]) // only 3 in stock
    renderApp('/checkout')
    expect(screen.getByText(/lowered because of limited stock/i)).toHaveTextContent('Voltix Strix 17 (now 3)')
  })
})

describe('placing an order as a guest', () => {
  it('creates the order, shows a confirmation and empties the cart', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 2 }]) // $498.00, free delivery, tax $39.84
    const user = userEvent.setup()
    renderApp('/checkout')
    await completeGuestForm(user)
    await user.click(placeOrderButton())

    expect(await screen.findByRole('heading', { level: 1, name: 'Thank you for your order' })).toBeInTheDocument()
    // Scoped to <main>: the screen-reader announcer also mentions the order number.
    expect(within(screen.getByRole('main')).getByText(/TC-\d{8}-\d{4}/)).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()

    const items = screen.getByRole('list', { name: 'Items in this order' })
    expect(within(items).getByText('Pulse S5')).toBeInTheDocument()
    expect(within(items).getByText('$498.00')).toBeInTheDocument()
    const grand = screen.getByText('Total').closest('div')!
    expect(within(grand).getByText('$537.84')).toBeInTheDocument()

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('1 Kimathi Street')).toBeInTheDocument()
    expect(screen.getByText('Standard delivery')).toBeInTheDocument()
    expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument()
    expect(cartLink()).toHaveAccessibleName('Cart, 0 items')
  })

  it('records the order without any account', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await completeGuestForm(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })

    const [order] = storedOrders()
    expect(order.userId).toBeNull()
    expect(order.email).toBe('grace@example.com')
    expect(order.lines).toEqual([{ productId: 'pulse-s5', name: 'Pulse S5', brand: 'Pulse', priceCents: 24900, quantity: 1 }])
    expect(order.totalCents).toBe(24900 + 1992)
  })

  it('never stores the card number, expiry or security code', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await completeGuestForm(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })

    const everything = JSON.stringify({ ...window.localStorage })
    expect(everything).not.toContain('4242424242424242')
    expect(everything).not.toContain('4242 4242 4242 4242')
    expect(everything).not.toContain('12/28')
    expect(storedOrders()[0].payment).toEqual({ method: 'card', brand: 'visa', last4: '4242' })
  })

  it('lowers stock so sold-out items cannot be bought again', async () => {
    seedCart([{ productId: 'voltix-strix-17', quantity: 3 }]) // buys all 3 in stock
    const user = userEvent.setup()
    renderApp('/checkout')
    await completeGuestForm(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.sold)!)).toEqual({ 'voltix-strix-17': 3 })

    await user.click(screen.getByRole('link', { name: 'Continue shopping' }))
    await user.click(within(screen.getByRole('list', { name: 'All products' })).getByRole('link', { name: 'Voltix Strix 17' }))
    expect(screen.getByText('Out of stock', { selector: '.stock' })).toBeInTheDocument()
  })

  it('supports pay on delivery without asking for card details', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.click(screen.getByRole('radio', { name: /pay on delivery/i }))
    expect(screen.queryByLabelText('Card number')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await fillDeliveryAddress(user)
    await user.click(placeOrderButton())

    expect(await screen.findByRole('heading', { name: 'Thank you for your order' })).toBeInTheDocument()
    expect(screen.getByText('Pay on delivery')).toBeInTheDocument()
    expect(storedOrders()[0].payment).toEqual({ method: 'cod' })
  })

  it('charges express delivery on the order', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.click(screen.getByRole('radio', { name: /express delivery/i }))
    await completeGuestForm(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })
    expect(storedOrders()[0]).toMatchObject({ shippingMethod: 'express', shippingCents: 1499 })
    expect(screen.getByText('Express delivery')).toBeInTheDocument()
  })
})

describe('checkout validation', () => {
  it('lists every problem, focuses the first, and places nothing', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.click(placeOrderButton())

    expect(screen.getByRole('alert')).toHaveTextContent(/fix the highlighted fields/i)
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText(/recipient’s full name/i)).toBeInTheDocument()
    expect(screen.getByText('Enter your card number.')).toBeInTheDocument()
    expect(screen.getByText('Enter the expiry date.')).toBeInTheDocument()
    await vi.waitFor(() => expect(screen.getByLabelText('Email')).toHaveFocus())
    expect(storedOrders()).toEqual([])
    expect(cartLink()).toHaveAccessibleName('Cart, 1 item')
  })

  it('rejects a card number that fails the checksum', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await fillDeliveryAddress(user)
    await fillCard(user, '4242 4242 4242 4241')
    await user.click(placeOrderButton())
    expect(screen.getByText(/card number does not look right/i)).toBeInTheDocument()
    expect(storedOrders()).toEqual([])
  })

  it('rejects an expired card', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await fillDeliveryAddress(user)
    await user.type(screen.getByLabelText('Card number'), '4242424242424242')
    await user.type(screen.getByLabelText('Name on card'), 'Grace Hopper')
    await user.type(screen.getByLabelText('Expiry date'), '0120')
    await user.type(screen.getByLabelText('Security code'), '123')
    await user.click(placeOrderButton())
    expect(screen.getByText('This card has expired.')).toBeInTheDocument()
  })

  it('formats the card number and expiry as you type', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.type(screen.getByLabelText('Card number'), '4242424242424242')
    expect(screen.getByLabelText('Card number')).toHaveValue('4242 4242 4242 4242')
    expect(screen.getByText('Visa')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Expiry date'), '0828')
    expect(screen.getByLabelText('Expiry date')).toHaveValue('08/28')
  })

  it('checks the delivery address the same way the address book does', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const user = userEvent.setup()
    renderApp('/checkout')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await fillDeliveryAddress(user, { ...NAIROBI, 'Postal code': '1' })
    await fillCard(user)
    await user.click(placeOrderButton())
    expect(screen.getByText(/valid postal code, like 00100/i)).toBeInTheDocument()
  })
})

describe('checkout when signed in', () => {
  async function signedInWithAnAddress() {
    const { user, view } = await registerAndLand()
    await user.click(screen.getByRole('link', { name: 'Addresses' }))
    await user.click(await screen.findByRole('button', { name: 'Add a new address' }))
    const form = within(screen.getByRole('form', { name: 'Save address' }))
    await user.selectOptions(form.getByLabelText('Country'), 'KE')
    await user.type(form.getByLabelText('Full name'), 'Ada Lovelace')
    await user.type(form.getByLabelText('Phone number'), '+254 700 000 000')
    await user.type(form.getByLabelText('Street address'), '12 Baker Street')
    await user.type(form.getByLabelText('City or town'), 'Nairobi')
    await user.type(form.getByLabelText('Postal code'), '00100')
    await user.type(form.getByLabelText(/^Label/), 'Home')
    await user.click(form.getByRole('button', { name: 'Save address' }))
    await screen.findByRole('heading', { name: 'Home' })
    view.unmount()
    return user
  }

  it('does not ask for an email and preselects the default saved address', async () => {
    const user = await signedInWithAnAddress()
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    renderApp('/checkout')

    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    expect(screen.getByText(ADA.email)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Home/ })).toBeChecked()
    expect(screen.queryByLabelText('Street address')).not.toBeInTheDocument()
    void user
  })

  it('places an order on a saved address and lists it in the account', async () => {
    const user = await signedInWithAnAddress()
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    renderApp('/checkout')
    await fillCard(user)
    await user.click(placeOrderButton())

    expect(await screen.findByRole('heading', { name: 'Thank you for your order' })).toBeInTheDocument()
    expect(screen.getByText('12 Baker Street')).toBeInTheDocument()
    const [order] = storedOrders()
    expect(order.userId).not.toBeNull()
    expect(order.email).toBe(ADA.email)

    await user.click(screen.getByRole('link', { name: 'View all my orders' }))
    const list = await screen.findByRole('list', { name: 'Your orders' })
    expect(within(list).getByRole('link', { name: /Order TC-\d{8}-\d{4}/ })).toHaveAttribute('href', `/orders/${order.id}`)
    expect(within(list).getByText('$268.92')).toBeInTheDocument() // 249.00 + 19.92 tax, free delivery
  })

  it('can deliver to a new address and save it to the account', async () => {
    const user = await signedInWithAnAddress()
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    renderApp('/checkout')
    await user.click(screen.getByRole('radio', { name: 'Use a different address' }))
    await fillDeliveryAddress(user)
    await user.click(screen.getByRole('checkbox', { name: 'Save this address to my account' }))
    await fillCard(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })

    expect(screen.getByText('1 Kimathi Street')).toBeInTheDocument()
    const savedAddresses = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.users)!)[0].addresses
    expect(savedAddresses.map((a: { line1: string }) => a.line1)).toEqual(['12 Baker Street', '1 Kimathi Street'])
  })

  it('keeps the order’s address even if the saved address is later deleted', async () => {
    const user = await signedInWithAnAddress()
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    const checkout = renderApp('/checkout')
    await fillCard(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })
    const orderPath = `/orders/${storedOrders()[0].id}`
    checkout.unmount()

    const book = renderApp('/account/addresses')
    await user.click(await screen.findByRole('button', { name: 'Delete Home' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete Home' }))
    book.unmount()

    renderApp(orderPath)
    expect(await screen.findByText('12 Baker Street')).toBeInTheDocument()
  })

  it('erases the account’s orders when the account is deleted', async () => {
    seedCart([{ productId: 'pulse-s5', quantity: 1 }]) // before rendering, so the app loads it
    const { user } = await registerAndLand()
    await user.click(cartLink())
    await user.click(screen.getByRole('link', { name: 'Proceed to checkout' }))
    await fillDeliveryAddress(user)
    await fillCard(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })
    expect(storedOrders()).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: 'My account (Ada Lovelace)' }))
    await user.click(screen.getByRole('link', { name: 'Password & security' }))
    await user.click(await screen.findByRole('button', { name: 'Delete my account' }))
    await user.type(screen.getByLabelText('Confirm with your password'), ADA.password)
    await user.click(screen.getByRole('button', { name: 'Permanently delete account' }))
    await screen.findByRole('heading', { level: 1, name: /gadgets you will actually use/i })

    expect(storedOrders()).toEqual([])
  })
})

describe('order pages', () => {
  it('shows a not-found page for an unknown order', () => {
    renderApp('/orders/nope')
    expect(screen.getByRole('heading', { name: 'Order not found' })).toBeInTheDocument()
  })

  it('keeps one account’s order private from a signed-out visitor', async () => {
    const { user, view } = await registerAndLand()
    seedCart([{ productId: 'pulse-s5', quantity: 1 }])
    view.unmount() // the next render loads the seeded cart
    const checkout = renderApp('/checkout')
    await fillDeliveryAddress(user)
    await fillCard(user)
    await user.click(placeOrderButton())
    await screen.findByRole('heading', { name: 'Thank you for your order' })
    const orderPath = `/orders/${storedOrders()[0].id}`
    checkout.unmount()

    // Sign out, then open the order link.
    const signedIn = renderApp('/account')
    await user.click(await screen.findByRole('button', { name: 'Sign out' }))
    signedIn.unmount()

    renderApp(orderPath)
    expect(screen.getByRole('heading', { name: 'Order not found' })).toBeInTheDocument()
  })

  it('shows an empty state on the orders page before any order', async () => {
    const { user } = await registerAndLand()
    await user.click(within(screen.getByRole('navigation', { name: 'Account' })).getByRole('link', { name: 'Orders' }))
    expect(await screen.findByRole('heading', { name: 'No orders yet' })).toBeInTheDocument()
  })
})
