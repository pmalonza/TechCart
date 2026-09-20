import { getCategory } from '../data/categories'
import type { Product } from '../types'

/** Lowercases and strips diacritics so "Café" and "cafe" compare equal. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Splits a query into lowercase search terms, ignoring punctuation and extra whitespace. */
export function tokenize(query: string): string[] {
  return normalize(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function words(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

/**
 * How well one search term matches a product, or 0 if it matches nothing.
 * Name matches outrank brand, category and tag matches, which outrank
 * matches buried in the description or feature list.
 */
function scoreTerm(product: Product, term: string): number {
  const nameWords = words(product.name)
  let score = 0

  if (nameWords.includes(term)) score += 10
  else if (nameWords.some((word) => word.startsWith(term))) score += 7
  else if (normalize(product.name).includes(term)) score += 4

  const brand = normalize(product.brand)
  if (brand === term) score += 6
  else if (brand.startsWith(term)) score += 4

  const category = normalize(getCategory(product.category).name)
  if (category === term || category.startsWith(term)) score += 3

  if (product.tags.some((tag) => words(tag).some((word) => word === term || word.startsWith(term)))) score += 3

  if (words(product.description).some((word) => word.startsWith(term))) score += 1
  if (product.specs.some((spec) => words(spec).some((word) => word.startsWith(term)))) score += 1

  return score
}

/**
 * Finds products matching every term in the query (AND semantics), best
 * match first; ties are broken by rating, then name. An empty query returns
 * the products unchanged.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = tokenize(query)
  if (terms.length === 0) return products

  const scored: { product: Product; score: number }[] = []
  for (const product of products) {
    let total = 0
    let matchesAll = true
    for (const term of terms) {
      const score = scoreTerm(product, term)
      if (score === 0) {
        matchesAll = false
        break
      }
      total += score
    }
    if (matchesAll) scored.push({ product, score: total })
  }

  scored.sort(
    (a, b) => b.score - a.score || b.product.rating - a.product.rating || a.product.name.localeCompare(b.product.name),
  )
  return scored.map((entry) => entry.product)
}

/** The top few matches, for the search box's suggestion dropdown. */
export function getSuggestions(products: Product[], query: string, limit = 5): Product[] {
  if (tokenize(query).length === 0) return []
  return searchProducts(products, query).slice(0, limit)
}
