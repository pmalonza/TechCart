import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { TrashIcon } from '../components/icons'
import ProductImage from '../components/ProductImage'
import QuantityStepper from '../components/QuantityStepper'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { maxQuantity } from '../lib/cart'
import { amountToFreeShipping, FREE_SHIPPING_THRESHOLD_CENTS } from '../lib/checkout'
import { formatPrice } from '../lib/money'

export default function CartPage() {
  const { summary, add, setQuantity, remove, clear } = useCart()
  useDocumentTitle('Your cart')

  if (summary.lines.length === 0) {
    return (
      <div className="container page">
        <div className="page-top">
          <BackButton fallback="/products" />
        </div>
        <div className="empty-state">
          <h1>Your cart is empty</h1>
          <p>Add something you like and it will show up here.</p>
          <Link className="btn btn-primary" to="/products">
            Start shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <div className="page-top">
        <BackButton fallback="/products" />
      </div>
      <header className="page-header">
        <h1>Your cart</h1>
        <p>
          {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
        </p>
      </header>

      <div className="cart-layout">
        <ul className="cart-lines" aria-label="Items in your cart">
          {summary.lines.map(({ product, quantity, lineTotalCents, reducedFrom }) => (
            <li key={product.id} className="cart-line">
              <Link className="cart-line-media" to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
                <ProductImage product={product} />
              </Link>

              <div className="cart-line-info">
                <p className="product-brand">{product.brand}</p>
                <h2 className="cart-line-name">
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                </h2>
                <p className="muted">{formatPrice(product.priceCents)} each</p>
                {reducedFrom !== undefined && (
                  <p className="cart-line-warning" role="status">
                    Only {quantity} available - we reduced the quantity from {reducedFrom}.
                  </p>
                )}
                {quantity >= maxQuantity(product) && reducedFrom === undefined && (
                  <p className="muted cart-line-note">Maximum quantity for this item.</p>
                )}
              </div>

              <div className="cart-line-controls">
                <QuantityStepper
                  label={product.name}
                  value={quantity}
                  max={maxQuantity(product)}
                  onChange={(next) => (next > quantity ? add(product, next - quantity) : setQuantity(product, next))}
                />
                <button
                  type="button"
                  className="btn-link cart-remove"
                  aria-label={`Remove ${product.name} from cart`}
                  onClick={() => remove(product.id)}
                >
                  <TrashIcon className="btn-icon" />
                  Remove
                </button>
              </div>

              <p className="cart-line-total" aria-label={`Line total ${formatPrice(lineTotalCents)}`}>
                {formatPrice(lineTotalCents)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="cart-summary card card-pad" aria-labelledby="summary-heading">
          <h2 id="summary-heading">Order summary</h2>
          <dl className="summary-rows">
            <div>
              <dt>Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})</dt>
              <dd>{formatPrice(summary.subtotalCents)}</dd>
            </div>
            {summary.savingsCents > 0 && (
              <div className="summary-savings">
                <dt>You save</dt>
                <dd>{formatPrice(summary.savingsCents)}</dd>
              </div>
            )}
          </dl>
          <p className="muted summary-note">
            {amountToFreeShipping(summary.subtotalCents) > 0
              ? `Add ${formatPrice(amountToFreeShipping(summary.subtotalCents))} more for free standard delivery on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} or more. `
              : 'Your order qualifies for free standard delivery. '}
            Delivery and taxes are calculated at checkout.
          </p>
          <Link className="btn btn-primary btn-block" to="/checkout">
            Proceed to checkout
          </Link>
          <Link className="btn btn-block summary-continue" to="/products">
            Continue shopping
          </Link>
          <button type="button" className="btn-link summary-clear" onClick={clear}>
            Empty cart
          </button>
        </aside>
      </div>
    </div>
  )
}
