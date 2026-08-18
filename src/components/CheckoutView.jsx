import { formatCurrency } from '../utils/currency'

export default function CheckoutView({ items, onBack, onPlaceOrder }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

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
      <button type="button" className="add-button" onClick={onPlaceOrder}>
        Place order
      </button>
    </section>
  )
}
