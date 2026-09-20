import { Link, useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'
import { CATEGORIES, getCategory, isCategoryId } from '../data/categories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { searchProducts } from '../lib/search'
import { productsUrl } from '../lib/urls'

export default function ProductsPage() {
  const { products } = useProducts()
  const [params] = useSearchParams()
  const categoryParam = params.get('category')
  const category = isCategoryId(categoryParam) ? categoryParam : null
  const query = params.get('q')?.trim() ?? ''

  const inCategory = category ? products.filter((product) => product.category === category) : products
  const visible = query ? searchProducts(inCategory, query) : inCategory

  const categoryName = category ? getCategory(category).name : null
  const heading = query ? `Results for “${query}”` : (categoryName ?? 'All products')
  const blurb = query
    ? categoryName
      ? `Searching in ${categoryName}.`
      : 'Searching every category.'
    : category
      ? getCategory(category).blurb
      : 'Everything in the store, across every category.'
  useDocumentTitle(query ? `Search: ${query}` : heading)

  const noun = query ? 'result' : 'product'

  return (
    <div className="container page">
      <header className="page-header">
        <h1>{heading}</h1>
        <p>{blurb}</p>
      </header>

      <nav className="chips" aria-label="Product categories">
        <Link className="chip" to={productsUrl({ query })} aria-current={category === null ? 'page' : undefined}>
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item.id}
            className="chip"
            to={productsUrl({ category: item.id, query })}
            aria-current={category === item.id ? 'page' : undefined}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <p className="result-count" role="status">
        {visible.length} {visible.length === 1 ? noun : `${noun}s`}
      </p>

      {visible.length > 0 ? (
        <ProductGrid products={visible} label={heading} />
      ) : (
        <div className="empty-state">
          <h2>{query ? 'No products match your search' : 'No products here yet'}</h2>
          <p>
            {query
              ? 'Check the spelling, try fewer or more general words, or browse a category.'
              : 'Try another category.'}
          </p>
          {query && (
            <Link className="btn btn-primary" to={productsUrl({ category })}>
              Clear search
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
