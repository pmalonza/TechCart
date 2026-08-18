import { useState } from 'react'
import { formatCurrency } from '../utils/currency'
import { PAYMENT_METHODS } from '../data/paymentMethods'

export default function CheckoutView({ items, onBack, onPlaceOrder }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const [address, setAddress] = useState({ street: '', city: '', postalCode: '' })
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
    setError('')
    onPlaceOrder({ address, paymentMethod })
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
      <p className="checkout-total">Total: {formatCurrency(total)}</p>

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
