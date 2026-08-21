import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutView from './CheckoutView'
import { getProduct } from '../data/products'

function makeItem(overrides = {}) {
  const product = getProduct('ref-3')
  return {
    variantId: 'ref-3::white::',
    productId: 'ref-3',
    colorId: 'white',
    colorLabel: 'White',
    size: null,
    quantity: 2,
    product,
    ...overrides,
  }
}

function renderCheckoutView(overrides = {}) {
  const items = overrides.items ?? [makeItem()]
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const props = {
    items,
    onBack: vi.fn(),
    onPlaceOrder: vi.fn(),
    subtotal,
    discount: null,
    discountAmount: 0,
    deliveryFee: 0,
    total: subtotal,
    ...overrides,
  }
  render(<CheckoutView {...props} />)
  return props
}

async function fillAddress(user) {
  await user.type(screen.getByLabelText('Street address'), '123 Main St')
  await user.type(screen.getByLabelText('City'), 'Springfield')
  await user.type(screen.getByLabelText('Postal code'), '12345')
}

async function fillCheckoutForm(user, { email = 'ada@gmail.com' } = {}) {
  await user.type(screen.getByLabelText('Email'), email)
  await fillAddress(user)
}

describe('CheckoutView', () => {
  it('lists items with quantity and shows the subtotal and total', () => {
    renderCheckoutView()

    expect(screen.getByText(/CompactCool Mini Fridge \(White\) × 2/)).toBeInTheDocument()
    expect(screen.getByText('Subtotal: $259.00')).toBeInTheDocument()
    expect(screen.getByText('Total: $259.00')).toBeInTheDocument()
  })

  it('shows an applied discount', () => {
    renderCheckoutView({
      discount: { code: 'SAVE10', type: 'percent', value: 10 },
      discountAmount: 25.9,
      total: 233.1,
    })

    expect(screen.getByText('Discount (SAVE10): -$25.90')).toBeInTheDocument()
    expect(screen.getByText('Total: $233.10')).toBeInTheDocument()
  })

  it('shows Free when there is no delivery fee', () => {
    renderCheckoutView()

    expect(screen.getByText('Delivery: Free')).toBeInTheDocument()
  })

  it('shows the delivery fee amount when charged', () => {
    renderCheckoutView({ deliveryFee: 9.99, total: 268.99 })

    expect(screen.getByText('Delivery: $9.99')).toBeInTheDocument()
    expect(screen.getByText('Total: $268.99')).toBeInTheDocument()
  })

  it('calls onBack when Back to cart is clicked', async () => {
    const user = userEvent.setup()
    const { onBack } = renderCheckoutView()

    await user.click(screen.getByRole('button', { name: /Back to cart/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('defaults to the first payment method', () => {
    renderCheckoutView()

    expect(screen.getByRole('radio', { name: 'PayPal' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Bank transfer' })).not.toBeChecked()
  })

  it('prefills the email from defaultEmail', () => {
    renderCheckoutView({ defaultEmail: 'ada@gmail.com' })
    expect(screen.getByLabelText('Email')).toHaveValue('ada@gmail.com')
  })

  it('prefills the address from the default saved address', () => {
    renderCheckoutView({
      savedAddresses: [
        { id: 'addr-1', label: 'Home', street: '123 Main St', city: 'Springfield', postalCode: '12345', isDefault: true },
      ],
    })

    expect(screen.getByLabelText('Street address')).toHaveValue('123 Main St')
    expect(screen.getByLabelText('City')).toHaveValue('Springfield')
    expect(screen.getByLabelText('Postal code')).toHaveValue('12345')
  })

  it('updates the address fields to whichever saved address is clicked, including a second one', async () => {
    const user = userEvent.setup()
    renderCheckoutView({
      savedAddresses: [
        { id: 'addr-1', label: 'Home', street: '123 Main St', city: 'Springfield', postalCode: '12345', isDefault: true },
        { id: 'addr-2', label: 'Work', street: '456 Oak Ave', city: 'Shelbyville', postalCode: '67890', isDefault: false },
      ],
    })

    expect(screen.getByLabelText('Street address')).toHaveValue('123 Main St')

    await user.click(screen.getByRole('button', { name: /Work: 456 Oak Ave/ }))

    expect(screen.getByLabelText('Street address')).toHaveValue('456 Oak Ave')
    expect(screen.getByLabelText('City')).toHaveValue('Shelbyville')
    expect(screen.getByLabelText('Postal code')).toHaveValue('67890')

    await user.click(screen.getByRole('button', { name: /Home: 123 Main St/ }))

    expect(screen.getByLabelText('Street address')).toHaveValue('123 Main St')
    expect(screen.getByLabelText('City')).toHaveValue('Springfield')
    expect(screen.getByLabelText('Postal code')).toHaveValue('12345')
  })

  it('rejects placing an order with an incomplete address', async () => {
    const user = userEvent.setup()
    const { onPlaceOrder } = renderCheckoutView()

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a complete delivery address.')
    expect(onPlaceOrder).not.toHaveBeenCalled()
  })

  it('rejects placing an order with an invalid email', async () => {
    const user = userEvent.setup()
    const { onPlaceOrder } = renderCheckoutView()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await fillAddress(user)
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email for order updates.')
    expect(onPlaceOrder).not.toHaveBeenCalled()
  })

  it('calls onPlaceOrder with the email, address, and default payment method', async () => {
    const user = userEvent.setup()
    const { onPlaceOrder } = renderCheckoutView()

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(onPlaceOrder).toHaveBeenCalledWith({
      address: { street: '123 Main St', city: 'Springfield', postalCode: '12345' },
      paymentMethod: 'paypal',
      email: 'ada@gmail.com',
    })
  })

  it('calls onPlaceOrder with the selected payment method', async () => {
    const user = userEvent.setup()
    const { onPlaceOrder } = renderCheckoutView()

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('radio', { name: 'Bank transfer' }))
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(onPlaceOrder).toHaveBeenCalledWith({
      address: { street: '123 Main St', city: 'Springfield', postalCode: '12345' },
      paymentMethod: 'bank',
      email: 'ada@gmail.com',
    })
  })
})
