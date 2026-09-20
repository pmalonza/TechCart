import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import { formatPrice } from '../../lib/money'
import { orderItemCount, ordersForUser } from '../../lib/orders'

export default function OrdersPage() {
  const { user } = useAuth()
  const { orders } = useOrders()
  const mine = user ? ordersForUser(orders, user.id) : []

  return (
    <section aria-labelledby="orders-heading" className="stack">
      <div className="card card-pad">
        <h2 id="orders-heading">My orders</h2>
        <p className="muted">Everything you have ordered with this account, newest first.</p>
      </div>

      {mine.length === 0 ? (
        <div className="card card-pad empty-state">
          <h3>No orders yet</h3>
          <p>When you place an order it will show up here.</p>
          <Link className="btn btn-primary" to="/products">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="order-list" aria-label="Your orders">
          {mine.map((order) => {
            const items = orderItemCount(order)
            return (
              <li key={order.id} className="card card-pad order-row">
                <div>
                  <h3>
                    <Link to={`/orders/${order.id}`}>Order {order.number}</Link>
                  </h3>
                  <p className="muted small">
                    Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} &middot; {items}{' '}
                    {items === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="order-row-total">
                  <strong>{formatPrice(order.totalCents)}</strong>
                  <span className="badge-pill badge-status">Processing</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
