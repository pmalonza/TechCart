import { formatCurrency } from '../utils/currency'
import ProductImage from './ProductImage'

export default function ProductCard({ product }) {
  return (
    <li className="product-card">
      <ProductImage subcategory={product.subcategory} />
      <h3 className="product-card-name">{product.name}</h3>
      <p className="product-card-description">{product.description}</p>
      <span className="product-card-price">{formatCurrency(product.price)}</span>
    </li>
  )
}
