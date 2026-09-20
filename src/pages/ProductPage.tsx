import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddToCartButton from '../components/AddToCartButton'
import BackButton from '../components/BackButton'
import Breadcrumbs from '../components/Breadcrumbs'
import { PriceTag, StockNote } from '../components/ProductCard'
import ProductGrid from '../components/ProductGrid'
import ProductImage from '../components/ProductImage'
import QuantityStepper from '../components/QuantityStepper'
import Rating from '../components/Rating'
import WishlistButton from '../components/WishlistButton'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { getCategory } from '../data/categories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { maxQuantity } from '../lib/cart'

export default function ProductPage() {
  const { id } = useParams()
  const { products, getProduct } = useProducts()
  const product = id ? getProduct(id) : undefined
  const { getQuantity } = useCart()
  const [wanted, setWanted] = useState(1)
  useEffect(() => {
    setWanted(1)
  }, [id])
  useDocumentTitle(product?.name ?? 'Product not found')

  if (!product) {
    return (
      <div className="container page empty-state">
        <h1>Product not found</h1>
        <p>This product may have been removed or the link may be wrong.</p>
        <Link className="btn btn-primary" to="/products">
          Browse all products
        </Link>
      </div>
    )
  }

  const category = getCategory(product.category)
  const inCart = getQuantity(product.id)
  const remaining = maxQuantity(product) - inCart
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)

  return (
    <div className="container page">
      <div className="page-top">
        <BackButton fallback={`/products?category=${category.id}`} />
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: category.name, to: `/products?category=${category.id}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="product-detail">
        <div className="product-detail-media">
          <ProductImage product={product} />
        </div>

        <div className="product-detail-info">
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <Rating rating={product.rating} reviewCount={product.reviewCount} />

          <div className="product-detail-price">
            <PriceTag product={product} />
            <StockNote stock={product.stock} />
          </div>

          <p className="product-detail-description">{product.description}</p>

          {product.stock > 0 && (
            <div className="purchase-row" role="group" aria-label="Purchase options">
              <QuantityStepper
                label={product.name}
                value={Math.min(wanted, Math.max(1, remaining))}
                max={Math.max(1, remaining)}
                onChange={setWanted}
              />
              <AddToCartButton product={product} quantity={Math.min(wanted, Math.max(1, remaining))} />
            </div>
          )}
          {inCart > 0 && (
            <p className="muted in-cart-note">
              {inCart} in your cart. <Link to="/cart">View cart</Link>
            </p>
          )}
          {product.stock <= 0 && <AddToCartButton product={product} />}
          <div className="wishlist-row">
            <WishlistButton product={product} variant="full" />
          </div>

          <section aria-labelledby="specs-heading">
            <h2 id="specs-heading" className="detail-subheading">
              Key features
            </h2>
            <ul className="spec-list">
              {product.specs.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          </section>

          <dl className="product-meta">
            <div>
              <dt>Category</dt>
              <dd>
                <Link to={`/products?category=${category.id}`}>{category.name}</Link>
              </dd>
            </div>
            <div>
              <dt>Brand</dt>
              <dd>{product.brand}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="section">
          <div className="section-head">
            <h2 id="related-heading">More in {category.name}</h2>
          </div>
          <ProductGrid products={related} label={`More in ${category.name}`} />
        </section>
      )}
    </div>
  )
}
