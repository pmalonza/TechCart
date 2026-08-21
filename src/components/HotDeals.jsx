import { formatCurrency } from '../utils/currency'
import { getOnSaleProducts } from '../data/products'

export default function HotDeals({ onSelect }) {
  const deals = getOnSaleProducts()

  if (deals.length === 0) {
    return null
  }

  return (
    <section className="hot-deals" aria-label="Hot deals">
      <p className="hot-deals-badge">🔥 Hot Deals</p>
      <ul className="hot-deals-list">
        {deals.map((product) => (
          <li key={product.id}>
            <button type="button" className="hot-deals-item" onClick={() => onSelect(product.id)}>
              <span className="hot-deals-item-name">{product.name}</span>
              <span className="hot-deals-item-price">
                <span className="product-card-original-price">{formatCurrency(product.originalPrice)}</span>
                {formatCurrency(product.price)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
