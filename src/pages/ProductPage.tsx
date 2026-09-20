import { Link, useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Breadcrumbs from '../components/Breadcrumbs'
import { PriceTag, StockNote } from '../components/ProductCard'
import ProductGrid from '../components/ProductGrid'
import ProductImage from '../components/ProductImage'
import Rating from '../components/Rating'
import { useProducts } from '../context/ProductsContext'
import { getCategory } from '../data/categories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ProductPage() {
  const { id } = useParams()
  const { products, getProduct } = useProducts()
  const product = id ? getProduct(id) : undefined
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
