import type { ReactNode } from 'react'
import { FREE_SHIPPING_THRESHOLD_CENTS, TAX_RATE, amountToFreeShipping, type ShippingMethodId, type Totals } from '../lib/checkout'
import type { CartSummary } from '../lib/cart'
import { formatPrice } from '../lib/money'
import ProductImage from './ProductImage'

interface OrderSummaryProps {
  summary: CartSummary
  totals: Totals
  shippingMethod: ShippingMethodId
  /** The action to show beneath the totals (the place-order button). */
  children?: ReactNode
}

/** The checkout sidebar: what is being bought and what it costs, itemised. */
export default function OrderSummary({ summary, totals, shippingMethod, children }: OrderSummaryProps) {
  const remaining = amountToFreeShipping(summary.subtotalCents)

  return (
    <aside className="card card-pad order-summary" aria-labelledby="order-summary-heading">
      <h2 id="order-summary-heading">Order summary</h2>

      <ul className="summary-items" aria-label="Items in your order">
        {summary.lines.map(({ product, quantity, lineTotalCents }) => (
          <li key={product.id}>
            <span className="summary-thumb">
              <ProductImage product={product} />
            </span>
            <span className="summary-item-info">
              <span className="summary-item-name">{product.name}</span>
              <span className="muted">Qty {quantity}</span>
            </span>
            <span className="summary-item-total">{formatPrice(lineTotalCents)}</span>
          </li>
        ))}
      </ul>

      <dl className="summary-rows">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(totals.subtotalCents)}</dd>
        </div>
        {summary.savingsCents > 0 && (
          <div className="summary-savings">
            <dt>Sale savings</dt>
            <dd>{formatPrice(summary.savingsCents)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>{totals.shippingCents === 0 ? 'Free' : formatPrice(totals.shippingCents)}</dd>
        </div>
        <div>
          <dt>Estimated tax ({Math.round(TAX_RATE * 100)}%)</dt>
          <dd>{formatPrice(totals.taxCents)}</dd>
        </div>
        <div className="summary-total">
          <dt>Total</dt>
          <dd>{formatPrice(totals.totalCents)}</dd>
        </div>
      </dl>

      {shippingMethod === 'standard' && remaining > 0 && (
        <p className="muted small">
          Add {formatPrice(remaining)} more for free standard delivery on orders of {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} or more.
        </p>
      )}

      {children}
    </aside>
  )
}
