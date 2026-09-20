import { Link } from 'react-router-dom'
import { formatPrice, percentOff } from '../lib/money'
import type { Product } from '../types'
import ProductImage from './ProductImage'
import Rating from './Rating'

export function StockNote({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="stock stock-out">Out of stock</span>
  if (stock <= 5) return <span className="stock stock-low">Only {stock} left</span>
  return <span className="stock stock-in">In stock</span>
}

export function PriceTag({ product }: { product: Pick<Product, 'priceCents' | 'compareAtCents'> }) {
  const { priceCents, compareAtCents } = product
  const onSale = compareAtCents !== undefined && compareAtCents > priceCents
  return (
    <span className="price-tag">
      <span className="price">{formatPrice(priceCents)}</span>
      {onSale && (
        <>
          <s className="price-was" aria-label={`Was ${formatPrice(compareAtCents)}`}>
            {formatPrice(compareAtCents)}
          </s>
          <span className="sale-badge">-{percentOff(priceCents, compareAtCents)}%</span>
        </>
      )}
    </span>
  )
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="product-card-media">
        <ProductImage product={product} />
      </div>
      <div className="product-card-body">
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-name">
          {/* The link's ::after overlay makes the whole card clickable. */}
          <Link className="product-link" to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <Rating rating={product.rating} reviewCount={product.reviewCount} />
        <PriceTag product={product} />
        <StockNote stock={product.stock} />
      </div>
    </article>
  )
}
