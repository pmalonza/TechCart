import { PRODUCTS } from '../data/products'
import {
  EMPTY_FILTERS,
  applyFilters,
  centsToInput,
  countActiveFilters,
  getBrandFacets,
  parseDollars,
  parseFilters,
  sortLabel,
  sortProducts,
  writeFilters,
  type Filters,
} from './filters'

const names = (products: { name: string }[]) => products.map((product) => product.name)
const withFilters = (overrides: Partial<Filters>): Filters => ({ ...EMPTY_FILTERS, ...overrides })

describe('parseDollars and centsToInput', () => {
  it('parses dollars into whole cents', () => {
    expect(parseDollars('249')).toBe(24900)
    expect(parseDollars('19.99')).toBe(1999)
    expect(parseDollars('0')).toBe(0)
  })

  it('rejects blank, negative and non-numeric input', () => {
    expect(parseDollars('')).toBeNull()
    expect(parseDollars('  ')).toBeNull()
    expect(parseDollars(null)).toBeNull()
    expect(parseDollars('-5')).toBeNull()
    expect(parseDollars('abc')).toBeNull()
    expect(parseDollars('Infinity')).toBeNull()
  })

  it('formats cents for an input box', () => {
    expect(centsToInput(24900)).toBe('249')
    expect(centsToInput(24950)).toBe('249.5')
    expect(centsToInput(null)).toBe('')
  })
})

describe('parseFilters and writeFilters', () => {
  it('reads every filter and the sort order from the URL', () => {
    const params = new URLSearchParams('brand=Nimbus&brand=Voltix&min=100&max=500&rating=4&stock=1&sale=1&sort=price-asc')
    expect(parseFilters(params)).toEqual({
      filters: {
        brands: ['Nimbus', 'Voltix'],
        minPriceCents: 10000,
        maxPriceCents: 50000,
        minRating: 4,
        inStockOnly: true,
        onSaleOnly: true,
      },
      sort: 'price-asc',
    })
  })

  it('falls back to defaults for an empty or invalid URL', () => {
    const { filters, sort } = parseFilters(new URLSearchParams('min=x&max=-1&rating=9&stock=yes&sort=chaos&brand='))
    expect(filters).toEqual(EMPTY_FILTERS)
    expect(sort).toBe('relevance')
  })

  it('swaps a minimum price that is above the maximum', () => {
    const { filters } = parseFilters(new URLSearchParams('min=500&max=100'))
    expect(filters.minPriceCents).toBe(10000)
    expect(filters.maxPriceCents).toBe(50000)
  })

  it('de-duplicates brands', () => {
    expect(parseFilters(new URLSearchParams('brand=Nimbus&brand=Nimbus')).filters.brands).toEqual(['Nimbus'])
  })

  it('round-trips through the URL while keeping unrelated parameters', () => {
    const filters = withFilters({ brands: ['Aurora'], minPriceCents: 5000, minRating: 3, inStockOnly: true })
    const written = writeFilters(new URLSearchParams('q=phone&category=phones'), filters, 'rating')
    expect(written.get('q')).toBe('phone')
    expect(written.get('category')).toBe('phones')
    expect(parseFilters(written)).toEqual({ filters, sort: 'rating' })
  })

  it('removes filter keys that are no longer set', () => {
    const before = new URLSearchParams('q=hub&brand=Lumen&min=10&sort=name&stock=1')
    const after = writeFilters(before, EMPTY_FILTERS, 'relevance')
    expect(after.toString()).toBe('q=hub')
  })
})

describe('applyFilters', () => {
  it('returns everything for empty filters', () => {
    expect(applyFilters(PRODUCTS, EMPTY_FILTERS)).toHaveLength(PRODUCTS.length)
  })

  it('filters by brand, case-insensitively, and allows several brands', () => {
    expect(names(applyFilters(PRODUCTS, withFilters({ brands: ['nimbus'] })))).toEqual([
      'Nimbus Air 14',
      'Nimbus Pro 16',
      'Nimbus Laptop Sleeve 14',
    ])
    const two = applyFilters(PRODUCTS, withFilters({ brands: ['Nimbus', 'Kestrel'] }))
    expect(new Set(two.map((product) => product.brand))).toEqual(new Set(['Nimbus', 'Kestrel']))
  })

  it('filters by price range, inclusive at both ends', () => {
    const result = applyFilters(PRODUCTS, withFilters({ minPriceCents: 5900, maxPriceCents: 7900 }))
    expect(names(result).sort()).toEqual(['Lumen Beam Speaker', 'Pulse Band 2', 'Voltix Pad Pro'])
  })

  it('supports a minimum only and a maximum only', () => {
    expect(applyFilters(PRODUCTS, withFilters({ minPriceCents: 150000 })).every((p) => p.priceCents >= 150000)).toBe(true)
    expect(applyFilters(PRODUCTS, withFilters({ maxPriceCents: 3000 })).every((p) => p.priceCents <= 3000)).toBe(true)
  })

  it('filters by minimum rating', () => {
    const result = applyFilters(PRODUCTS, withFilters({ minRating: 4.5 }))
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((product) => product.rating >= 4.5)).toBe(true)
  })

  it('hides sold-out products when asked', () => {
    expect(names(applyFilters(PRODUCTS, EMPTY_FILTERS))).toContain('Orbit Fold')
    expect(names(applyFilters(PRODUCTS, withFilters({ inStockOnly: true })))).not.toContain('Orbit Fold')
  })

  it('shows only discounted products when asked', () => {
    const result = applyFilters(PRODUCTS, withFilters({ onSaleOnly: true }))
    expect(names(result).sort()).toEqual(
      ['Nimbus Pro 16', 'Orbit Fold', 'Voltix Console X', 'Zenith Studio Over-Ear'].sort(),
    )
  })

  it('combines filters with AND', () => {
    const result = applyFilters(PRODUCTS, withFilters({ onSaleOnly: true, inStockOnly: true, brands: ['Zenith'] }))
    expect(names(result)).toEqual(['Zenith Studio Over-Ear'])
  })
})

describe('sortProducts', () => {
  it('keeps the incoming order for relevance, without mutating the input', () => {
    const input = [...PRODUCTS]
    expect(sortProducts(input, 'relevance')).toEqual(input)
    expect(input).toEqual(PRODUCTS)
  })

  it('sorts by price both ways', () => {
    const asc = sortProducts(PRODUCTS, 'price-asc').map((p) => p.priceCents)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const desc = sortProducts(PRODUCTS, 'price-desc').map((p) => p.priceCents)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it('sorts by rating, review count and name', () => {
    expect(sortProducts(PRODUCTS, 'rating')[0].rating).toBe(4.8)
    expect(sortProducts(PRODUCTS, 'reviews')[0].name).toBe('Orbit Power Bank 20K')
    const byName = names(sortProducts(PRODUCTS, 'name'))
    expect(byName).toEqual([...byName].sort((a, b) => a.localeCompare(b)))
  })
})

describe('facets and labels', () => {
  it('counts products per brand, alphabetically', () => {
    const facets = getBrandFacets(PRODUCTS)
    expect(facets.map((facet) => facet.brand)).toEqual(['Aurora', 'Kestrel', 'Lumen', 'Nimbus', 'Orbit', 'Pulse', 'Voltix', 'Zenith'])
    expect(facets.reduce((total, facet) => total + facet.count, 0)).toBe(PRODUCTS.length)
    expect(facets.find((facet) => facet.brand === 'Voltix')?.count).toBe(4)
  })

  it('counts a price range as one active filter', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0)
    expect(
      countActiveFilters(
        withFilters({ brands: ['A', 'B'], minPriceCents: 1, maxPriceCents: 2, minRating: 4, inStockOnly: true, onSaleOnly: true }),
      ),
    ).toBe(6)
  })

  it('labels the default sort differently for searches', () => {
    expect(sortLabel('relevance', true)).toBe('Best match')
    expect(sortLabel('relevance', false)).toBe('Featured')
  })
})
