import { formatCurrency } from '../utils/currency'
import { getPaymentMethodLabel } from '../data/paymentMethods'

export default function OrderConfirmation({ order, onContinueShopping }) {
  return (
    <section className="order-confirmation" aria-label="Order confirmation">
      <p role="status" className="order-confirmation-message">
        Order {order.id} placed. Thank you!
      </p>
      <p className="order-confirmation-detail">
        Shipping to {order.address.street}, {order.address.city} {order.address.postalCode}
      </p>
      <p className="order-confirmation-detail">
        Payment method: {getPaymentMethodLabel(order.paymentMethod)}
      </p>
      <ul className="checkout-items">
        {order.items.map((item) => (
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
      <p className="checkout-total">Total: {formatCurrency(order.total)}</p>
      <button type="button" className="add-button" onClick={onContinueShopping}>
        Continue shopping
      </button>
    </section>
  )
}
