import { useState } from 'react'
import { formatCurrency } from '../utils/currency'
import { PAYMENT_METHODS } from '../data/paymentMethods'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CheckoutView({
  items,
  onBack,
  onPlaceOrder,
  subtotal,
  discount,
  discountAmount,
  deliveryFee,
  total,
  defaultEmail = '',
  savedAddresses = [],
}) {
  const defaultAddress = savedAddresses.find((saved) => saved.isDefault)
  const [address, setAddress] = useState(() =>
    defaultAddress
      ? { street: defaultAddress.street, city: defaultAddress.city, postalCode: defaultAddress.postalCode }
      : { street: '', city: '', postalCode: '' },
  )
  const [email, setEmail] = useState(defaultEmail)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id)
  const [error, setError] = useState('')

  function handleAddressChange(event) {
    const { name, value } = event.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  function handlePlaceOrder() {
    if (!address.street.trim() || !address.city.trim() || !address.postalCode.trim()) {
      setError('Enter a complete delivery address.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email for order updates.')
      return
    }
    setError('')
    onPlaceOrder({ address, paymentMethod, email: email.trim() })
  }

  return (
    <section className="checkout-view" aria-label="Checkout">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back to cart
      </button>
      <h2>Checkout</h2>
      <ul className="checkout-items">
        {items.map((item) => (
          <li key={item.variantId} className="checkout-item">
            <span>
              {item.product.name}
              {item.colorLabel ? ` (${item.colorLabel}${item.size ? `, ${item.size}` : ''})` : ''} ×{' '}
              {item.quantity}
            </span>
            <span>{formatCurrency(item.product.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="cart-subtotal">Subtotal: {formatCurrency(subtotal)}</p>
      {discount && (
        <p className="discount-applied">
          Discount ({discount.code}): -{formatCurrency(discountAmount)}
        </p>
      )}
      <p className="cart-subtotal">
        Delivery: {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free'}
      </p>
      <p className="checkout-total">Total: {formatCurrency(total)}</p>

      <fieldset className="checkout-section">
        <legend>Order updates</legend>
        <div className="field">
          <label htmlFor="checkout-email">Email</label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </fieldset>

      {savedAddresses.length > 0 && (
        <fieldset className="checkout-section">
          <legend>Saved addresses</legend>
          <div className="saved-address-list">
            {savedAddresses.map((saved) => (
              <button
                key={saved.id}
                type="button"
                className="saved-address-option"
                onClick={() =>
                  setAddress({ street: saved.street, city: saved.city, postalCode: saved.postalCode })
                }
              >
                {saved.label ? `${saved.label}: ` : ''}
                {saved.street}, {saved.city} {saved.postalCode}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="checkout-section">
        <legend>Delivery address</legend>
        <div className="field">
          <label htmlFor="checkout-street">Street address</label>
          <input
            id="checkout-street"
            name="street"
            type="text"
            value={address.street}
            onChange={handleAddressChange}
          />
        </div>
        <div className="field">
          <label htmlFor="checkout-city">City</label>
          <input
            id="checkout-city"
            name="city"
            type="text"
            value={address.city}
            onChange={handleAddressChange}
          />
        </div>
        <div className="field">
          <label htmlFor="checkout-postal-code">Postal code</label>
          <input
            id="checkout-postal-code"
            name="postalCode"
            type="text"
            value={address.postalCode}
            onChange={handleAddressChange}
          />
        </div>
      </fieldset>

      <fieldset className="checkout-section">
        <legend>Payment method</legend>
        <div className="payment-options">
          {PAYMENT_METHODS.map((method) => (
            <label key={method.id} className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id)}
              />
              {method.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" className="add-button" onClick={handlePlaceOrder}>
        Place order
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
