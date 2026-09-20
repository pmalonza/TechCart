export interface ProductsUrlOptions {
  category?: string | null
  query?: string | null
}

/** Builds a /products URL, omitting any option that is empty. */
export function productsUrl({ category, query }: ProductsUrlOptions = {}): string {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (query && query.trim()) params.set('q', query.trim())
  const search = params.toString()
  return search ? `/products?${search}` : '/products'
}
