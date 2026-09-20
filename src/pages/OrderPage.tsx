import { Link, useParams } from 'react-router-dom'
import AddressLines from '../components/AddressLines'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getShippingMethod } from '../lib/checkout'
import { formatPrice } from '../lib/money'
import { canViewOrder, orderItemCount, type OrderPayment } from '../lib/orders'
import { CARD_BRAND_NAMES } from '../lib/payment'

function paymentLabel(payment: OrderPayment): string {
  return payment.method === 'cod' ? 'Pay on delivery' : `${CARD_BRAND_NAMES[payment.brand]} ending in ${payment.last4}`
}

export default function OrderPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { getOrder } = useOrders()
  const order = id ? getOrder(id) : undefined
  const visible = order && canViewOrder(order, user?.id ?? null) ? order : undefined
  useDocumentTitle(visible ? `Order ${visible.number}` : 'Order not found')

  if (!visible) {
    return (
      <div className="container page empty-state">
        <h1>Order not found</h1>
        <p>We could not find that order. If it belongs to your account, sign in to see it.</p>
        <Link className="btn btn-primary" to={user ? '/account/orders' : '/login'}>
          {user ? 'View my orders' : 'Sign in'}
        </Link>
      </div>
    )
  }

  const shipping = getShippingMethod(visible.shippingMethod)
  const items = orderItemCount(visible)

  return (
    <div className="container page">
      <div className="page-top">
        <BackButton fallback="/" />
      </div>

      <header className="order-hero card card-pad">
        <p className="order-check" aria-hidden="true">
          &#10003;
        </p>
        <h1>Thank you for your order</h1>
        <p>
          Order <strong>{visible.number}</strong> was placed on{' '}
          {new Date(visible.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
        <p className="muted">
          A confirmation would be emailed to <strong>{visible.email}</strong>. This is a demo store, so no email is sent and nothing will be delivered.
        </p>
      </header>

      <div className="order-layout">
        <section className="card card-pad" aria-labelledby="order-items-heading">
          <h2 id="order-items-heading">
            {items} {items === 1 ? 'item' : 'items'}
          </h2>
          <ul className="order-lines" aria-label="Items in this order">
            {visible.lines.map((line) => (
              <li key={line.productId}>
                <span>
                  <strong>{line.name}</strong>
                  <span className="muted">
                    {' '}
                    &times; {line.quantity} at {formatPrice(line.priceCents)}
                  </span>
                </span>
                <span>{formatPrice(line.priceCents * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="summary-rows">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(visible.subtotalCents)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{visible.shippingCents === 0 ? 'Free' : formatPrice(visible.shippingCents)}</dd>
            </div>
            <div>
              <dt>Estimated tax</dt>
              <dd>{formatPrice(visible.taxCents)}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatPrice(visible.totalCents)}</dd>
            </div>
          </dl>
        </section>

        <div className="stack">
          <section className="card card-pad" aria-labelledby="order-delivery-heading">
            <h2 id="order-delivery-heading">Delivery</h2>
            <p>
              <strong>{shipping.name}</strong>
              <span className="muted"> {shipping.eta}</span>
            </p>
            <AddressLines address={visible.shippingAddress} />
          </section>

          <section className="card card-pad" aria-labelledby="order-payment-heading">
            <h2 id="order-payment-heading">Payment</h2>
            <p>{paymentLabel(visible.payment)}</p>
            <p className="muted small">Status: Processing</p>
          </section>
        </div>
      </div>

      <div className="button-row order-actions">
        <Link className="btn btn-primary" to="/products">
          Continue shopping
        </Link>
        {user && (
          <Link className="btn" to="/account/orders">
            View all my orders
          </Link>
        )}
      </div>
    </div>
  )
}
