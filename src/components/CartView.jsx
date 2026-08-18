import { useEffect, useState } from 'react'
import { formatCurrency } from '../utils/currency'

function QuantityInput({ variantId, quantity, onUpdateQuantity }) {
  const [draft, setDraft] = useState(String(quantity))

  useEffect(() => {
    setDraft(String(quantity))
  }, [quantity])

  function handleChange(event) {
    const { value } = event.target
    setDraft(value)
    if (value !== '' && Number(value) > 0) {
      onUpdateQuantity(variantId, Number(value))
    }
  }

  function handleBlur(event) {
    const parsed = Math.max(1, Number(event.target.value) || 1)
    setDraft(String(parsed))
    onUpdateQuantity(variantId, parsed)
  }

  return (
    <input
      id={`cart-qty-${variantId}`}
      type="number"
      min="1"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}

export default function CartView({
  items,
  onUpdateQuantity,
  onRemove,
  onBack,
  onCheckout,
  subtotal,
  discount,
  discountAmount,
  total,
  onApplyDiscount,
  onRemoveDiscount,
}) {
  const [codeInput, setCodeInput] = useState('')
  const [discountError, setDiscountError] = useState('')

  function handleApplyDiscount(event) {
    event.preventDefault()
    const result = onApplyDiscount(codeInput)
    if (!result.ok) {
      setDiscountError(result.message)
      return
    }
    setDiscountError('')
    setCodeInput('')
  }

  function handleRemoveDiscount() {
    onRemoveDiscount()
    setDiscountError('')
  }

  return (
    <section className="cart-view" aria-label="Shopping cart">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Continue shopping
      </button>
      <h2>Your cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map((item) => (
              <li key={item.variantId} className="cart-item">
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-variant">
                    {item.colorLabel}
                    {item.size ? ` · ${item.size}` : ''}
                  </p>
                  <p className="cart-item-price">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="cart-item-controls">
                  <label htmlFor={`cart-qty-${item.variantId}`}>Qty</label>
                  <QuantityInput
                    variantId={item.variantId}
                    quantity={item.quantity}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                  <button type="button" className="text-button" onClick={() => onRemove(item.variantId)}>
                    Remove
                  </button>
                </div>
                <p className="cart-item-subtotal">{formatCurrency(item.product.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <form className="discount-form" onSubmit={handleApplyDiscount}>
            <label htmlFor="discount-code">Discount code</label>
            <input
              id="discount-code"
              type="text"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
            />
            <button type="submit" className="text-button">
              Apply
            </button>
          </form>
          {discountError && (
            <p className="form-error" role="alert">
              {discountError}
            </p>
          )}
          {discount && (
            <p className="discount-applied">
              Code {discount.code} applied: -{formatCurrency(discountAmount)}{' '}
              <button
                type="button"
                className="text-button"
                aria-label="Remove discount code"
                onClick={handleRemoveDiscount}
              >
                Remove
              </button>
            </p>
          )}

          <p className="cart-subtotal">Subtotal: {formatCurrency(subtotal)}</p>
          <p className="cart-total">Total: {formatCurrency(total)}</p>
          <button type="button" className="add-button" onClick={onCheckout}>
            Checkout
          </button>
        </>
      )}
    </section>
  )
}
