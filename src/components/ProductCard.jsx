import { formatCurrency } from '../utils/currency'
import ProductImage from './ProductImage'
import { getProductImage } from '../data/productImages'

export default function ProductCard({ product, onSelect }) {
  return (
    <li className="product-card-item">
      <button type="button" className="product-card" onClick={() => onSelect(product.id)}>
        <ProductImage subcategory={product.subcategory} imageUrl={getProductImage(product.id)} />
        <p className="product-card-name">{product.name}</p>
        <p className="product-card-description">{product.description}</p>
        <span className="product-card-price-row">
          {product.originalPrice > product.price && (
            <span className="product-card-original-price">{formatCurrency(product.originalPrice)}</span>
          )}
          <span className="product-card-price">{formatCurrency(product.price)}</span>
        </span>
      </button>
    </li>
  )
}
