import { formatCurrency } from '../utils/currency'

export default function ProductCard({ product }) {
  return (
    <li className="product-card">
      <span className="product-card-icon" aria-hidden="true">
        {product.icon}
      </span>
      <h3 className="product-card-name">{product.name}</h3>
      <p className="product-card-description">{product.description}</p>
      <span className="product-card-price">{formatCurrency(product.price)}</span>
    </li>
  )
}
