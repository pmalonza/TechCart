import { formatCurrency } from '../utils/currency'
import { getOrderStatus } from '../data/orderStatus'

export default function OrderHistoryView({ orders, onBack, onTrack }) {
  return (
    <section className="order-history-view" aria-label="Order history">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Your orders</h2>
      {orders.length === 0 ? (
        <p>You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="order-history-list">
          {orders.map((order) => (
            <li key={order.id} className="order-history-item">
              <div className="order-history-item-info">
                <p className="order-history-item-id">{order.id}</p>
                <p className="order-history-item-status">{getOrderStatus(order.status).label}</p>
              </div>
              <span className="order-history-item-total">{formatCurrency(order.total)}</span>
              <button type="button" className="text-button" onClick={() => onTrack(order.id)}>
                Track order
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
