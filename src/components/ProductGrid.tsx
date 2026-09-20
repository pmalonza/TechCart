import type { Product } from '../types'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, label }: { products: Product[]; label: string }) {
  return (
    <ul className="product-grid" aria-label={label}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
