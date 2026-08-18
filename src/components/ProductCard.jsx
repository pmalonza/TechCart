import { formatCurrency } from '../utils/currency'
import ProductImage from './ProductImage'

export default function ProductCard({ product, onSelect }) {
  return (
    <li className="product-card-item">
      <button type="button" className="product-card" onClick={() => onSelect(product.id)}>
        <ProductImage subcategory={product.subcategory} />
        <p className="product-card-name">{product.name}</p>
        <p className="product-card-description">{product.description}</p>
        <span className="product-card-price">{formatCurrency(product.price)}</span>
      </button>
    </li>
  )
}
