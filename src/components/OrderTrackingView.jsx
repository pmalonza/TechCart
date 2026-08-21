import { formatCurrency } from '../utils/currency'
import { ORDER_STATUSES, getNextOrderStatus } from '../data/orderStatus'

export default function OrderTrackingView({ order, onBack, onAdvanceStatus }) {
  const currentIndex = ORDER_STATUSES.findIndex((status) => status.id === order.status)
  const nextStatus = getNextOrderStatus(order.status)

  return (
    <section className="order-tracking-view" aria-label="Order tracking">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back to orders
      </button>
      <h2>{order.id}</h2>
      <p className="order-tracking-total">{formatCurrency(order.total)}</p>

      <ol className="order-tracking-timeline">
        {ORDER_STATUSES.map((status, index) => (
          <li
            key={status.id}
            className={
              index <= currentIndex
                ? 'order-tracking-step order-tracking-step-complete'
                : 'order-tracking-step'
            }
          >
            {status.label}
          </li>
        ))}
      </ol>

      {nextStatus && (
        <button
          type="button"
          className="text-button"
          onClick={() => onAdvanceStatus(order.id)}
        >
          Simulate: mark as {ORDER_STATUSES.find((status) => status.id === nextStatus).label}
        </button>
      )}
    </section>
  )
}
