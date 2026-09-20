import { Link, useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'
import { CATEGORIES, getCategory, isCategoryId } from '../data/categories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ProductsPage() {
  const { products } = useProducts()
  const [params] = useSearchParams()
  const categoryParam = params.get('category')
  const category = isCategoryId(categoryParam) ? categoryParam : null

  const visible = category ? products.filter((product) => product.category === category) : products
  const heading = category ? getCategory(category).name : 'All products'
  useDocumentTitle(heading)
  const blurb = category ? getCategory(category).blurb : 'Everything in the store, across every category.'

  return (
    <div className="container page">
      <header className="page-header">
        <h1>{heading}</h1>
        <p>{blurb}</p>
      </header>

      <nav className="chips" aria-label="Product categories">
        <Link className="chip" to="/products" aria-current={category === null ? 'page' : undefined}>
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item.id}
            className="chip"
            to={`/products?category=${item.id}`}
            aria-current={category === item.id ? 'page' : undefined}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <p className="result-count" role="status">
        {visible.length} {visible.length === 1 ? 'product' : 'products'}
      </p>

      {visible.length > 0 ? (
        <ProductGrid products={visible} label={heading} />
      ) : (
        <div className="empty-state">
          <h2>No products here yet</h2>
          <p>Try another category.</p>
        </div>
      )}
    </div>
  )
}
