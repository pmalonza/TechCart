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

export default function CartView({ items, onUpdateQuantity, onRemove, onBack }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

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
          <p className="cart-total">Total: {formatCurrency(total)}</p>
        </>
      )}
    </section>
  )
}
