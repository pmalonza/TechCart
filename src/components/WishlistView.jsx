import { formatCurrency } from '../utils/currency'
import ProductImage from './ProductImage'

export default function WishlistView({ items, onBack, onSelect, onRemove }) {
  return (
    <section className="wishlist-view" aria-label="Wishlist">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Your wishlist</h2>
      {items.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <ul className="wishlist-list">
          {items.map((product) => (
            <li key={product.id} className="wishlist-item">
              <button
                type="button"
                className="wishlist-item-main"
                onClick={() => onSelect(product.id)}
              >
                <ProductImage subcategory={product.subcategory} />
                <span className="wishlist-item-name">{product.name}</span>
                <span className="wishlist-item-price">{formatCurrency(product.price)}</span>
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.name} from wishlist`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
