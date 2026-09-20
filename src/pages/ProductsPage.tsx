import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ActiveFilters from '../components/ActiveFilters'
import FilterPanel from '../components/FilterPanel'
import ProductGrid from '../components/ProductGrid'
import SortSelect from '../components/SortSelect'
import { useProducts } from '../context/ProductsContext'
import { CATEGORIES, getCategory, isCategoryId } from '../data/categories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  EMPTY_FILTERS,
  applyFilters,
  countActiveFilters,
  getBrandFacets,
  parseFilters,
  sortProducts,
  writeFilters,
  type Filters,
  type SortKey,
} from '../lib/filters'
import { searchProducts } from '../lib/search'
import { productsUrl } from '../lib/urls'

export default function ProductsPage() {
  const { products } = useProducts()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categoryParam = params.get('category')
  const category = isCategoryId(categoryParam) ? categoryParam : null
  const query = params.get('q')?.trim() ?? ''
  const { filters, sort } = useMemo(() => parseFilters(params), [params])

  const inCategory = category ? products.filter((product) => product.category === category) : products
  const searched = query ? searchProducts(inCategory, query) : inCategory
  const facets = getBrandFacets(searched)
  const visible = sortProducts(applyFilters(searched, filters), sort)
  const activeCount = countActiveFilters(filters)

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

  // Filter changes replace the history entry so the back button leaves the page instead of undoing each tick.
  function update(nextFilters: Filters, nextSort: SortKey = sort) {
    setParams(writeFilters(params, nextFilters, nextSort), { replace: true })
  }
  const clearFilters = () => update(EMPTY_FILTERS)

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

      <div className="listing">
        <div className={filtersOpen ? 'filters-wrap is-open' : 'filters-wrap'}>
          <FilterPanel
            id="filter-panel"
            facets={facets}
            filters={filters}
            activeCount={activeCount}
            onChange={update}
            onClear={clearFilters}
          />
        </div>

        <div className="listing-main">
          <div className="listing-toolbar">
            <p className="result-count" role="status">
              {visible.length} {visible.length === 1 ? noun : `${noun}s`}
            </p>
            <button
              type="button"
              className="btn btn-sm filters-toggle"
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            </button>
            <SortSelect value={sort} hasQuery={query !== ''} onChange={(next) => update(filters, next)} />
          </div>

          <ActiveFilters filters={filters} onChange={update} onClear={clearFilters} />

          {visible.length > 0 ? (
            <ProductGrid products={visible} label={heading} />
          ) : (
            <div className="empty-state">
              <h2>
                {activeCount > 0
                  ? 'No products match these filters'
                  : query
                    ? 'No products match your search'
                    : 'No products here yet'}
              </h2>
              <p>
                {activeCount > 0
                  ? 'Try removing a filter or widening the price range.'
                  : query
                    ? 'Check the spelling, try fewer or more general words, or browse a category.'
                    : 'Try another category.'}
              </p>
              {activeCount > 0 ? (
                <button type="button" className="btn btn-primary" onClick={clearFilters}>
                  Clear all filters
                </button>
              ) : (
                query && (
                  <Link className="btn btn-primary" to={productsUrl({ category })}>
                    Clear search
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
