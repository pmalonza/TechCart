import type { Product } from '../types'

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'reviews' | 'name'

export interface Filters {
  brands: string[]
  minPriceCents: number | null
  maxPriceCents: number | null
  /** Minimum star rating (a product must have at least this many stars). */
  minRating: number | null
  inStockOnly: boolean
  onSaleOnly: boolean
}

export const EMPTY_FILTERS: Filters = {
  brands: [],
  minPriceCents: null,
  maxPriceCents: null,
  minRating: null,
  inStockOnly: false,
  onSaleOnly: false,
}

export const SORT_KEYS: SortKey[] = ['relevance', 'price-asc', 'price-desc', 'rating', 'reviews', 'name']

/** "relevance" keeps whatever order the list arrived in: best match for a search, catalog order otherwise. */
export function sortLabel(key: SortKey, hasQuery: boolean): string {
  switch (key) {
    case 'relevance':
      return hasQuery ? 'Best match' : 'Featured'
    case 'price-asc':
      return 'Price: low to high'
    case 'price-desc':
      return 'Price: high to low'
    case 'rating':
      return 'Top rated'
    case 'reviews':
      return 'Most reviewed'
    case 'name':
      return 'Name: A to Z'
  }
}

function isSortKey(value: string | null): value is SortKey {
  return SORT_KEYS.includes(value as SortKey)
}

/** Parses a dollar amount from a URL/input string into cents; blank, negative or non-numeric gives null. */
export function parseDollars(text: string | null | undefined): number | null {
  if (text === null || text === undefined || text.trim() === '') return null
  const value = Number(text)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100)
}

/** Formats cents as a plain number for an input box: 24900 -> "249", 24950 -> "249.5". */
export function centsToInput(cents: number | null): string {
  return cents === null ? '' : String(cents / 100)
}

/** Reads filters and the sort order out of URL parameters, ignoring anything invalid. */
export function parseFilters(params: URLSearchParams): { filters: Filters; sort: SortKey } {
  const brands = [...new Set(params.getAll('brand').map((brand) => brand.trim()).filter(Boolean))]

  let minPriceCents = parseDollars(params.get('min'))
  let maxPriceCents = parseDollars(params.get('max'))
  if (minPriceCents !== null && maxPriceCents !== null && minPriceCents > maxPriceCents) {
    ;[minPriceCents, maxPriceCents] = [maxPriceCents, minPriceCents]
  }

  const ratingValue = Number(params.get('rating'))
  const minRating = Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5 ? ratingValue : null

  const sortParam = params.get('sort')
  return {
    filters: {
      brands,
      minPriceCents,
      maxPriceCents,
      minRating,
      inStockOnly: params.get('stock') === '1',
      onSaleOnly: params.get('sale') === '1',
    },
    sort: isSortKey(sortParam) ? sortParam : 'relevance',
  }
}

/** Returns a copy of `params` with the filter and sort keys replaced; other keys (q, category) are kept. */
export function writeFilters(params: URLSearchParams, filters: Filters, sort: SortKey): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const key of ['brand', 'min', 'max', 'rating', 'stock', 'sale', 'sort']) next.delete(key)

  for (const brand of filters.brands) next.append('brand', brand)
  if (filters.minPriceCents !== null) next.set('min', centsToInput(filters.minPriceCents))
  if (filters.maxPriceCents !== null) next.set('max', centsToInput(filters.maxPriceCents))
  if (filters.minRating !== null) next.set('rating', String(filters.minRating))
  if (filters.inStockOnly) next.set('stock', '1')
  if (filters.onSaleOnly) next.set('sale', '1')
  if (sort !== 'relevance') next.set('sort', sort)
  return next
}

export function isOnSale(product: Product): boolean {
  return product.compareAtCents !== undefined && product.compareAtCents > product.priceCents
}

export function applyFilters(products: Product[], filters: Filters): Product[] {
  const brands = new Set(filters.brands.map((brand) => brand.toLowerCase()))
  return products.filter((product) => {
    if (brands.size > 0 && !brands.has(product.brand.toLowerCase())) return false
    if (filters.minPriceCents !== null && product.priceCents < filters.minPriceCents) return false
    if (filters.maxPriceCents !== null && product.priceCents > filters.maxPriceCents) return false
    if (filters.minRating !== null && product.rating < filters.minRating) return false
    if (filters.inStockOnly && product.stock <= 0) return false
    if (filters.onSaleOnly && !isOnSale(product)) return false
    return true
  })
}

/** Sorts a copy of `products`; ties keep their incoming order (the sort is stable). */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.priceCents - b.priceCents)
    case 'price-desc':
      return sorted.sort((a, b) => b.priceCents - a.priceCents)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'reviews':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'relevance':
      return sorted
  }
}

export interface BrandFacet {
  brand: string
  count: number
}

/** Distinct brands with how many products each has, alphabetically. */
export function getBrandFacets(products: Product[]): BrandFacet[] {
  const counts = new Map<string, number>()
  for (const product of products) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1)
  return [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand))
}

export function countActiveFilters(filters: Filters): number {
  return (
    filters.brands.length +
    (filters.minPriceCents !== null || filters.maxPriceCents !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0)
  )
}
