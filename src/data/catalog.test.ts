import { CATEGORIES, getCategory, isCategoryId } from './categories'
import { PRODUCTS } from './products'

describe('catalog data', () => {
  it('has unique product ids', () => {
    const ids = PRODUCTS.map((product) => product.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('puts every product in a real category and every category has products', () => {
    for (const product of PRODUCTS) {
      expect(isCategoryId(product.category)).toBe(true)
    }
    for (const category of CATEGORIES) {
      expect(PRODUCTS.some((product) => product.category === category.id)).toBe(true)
    }
  })

  it('stores money as positive integer cents and sale prices below the compare-at price', () => {
    for (const product of PRODUCTS) {
      expect(Number.isInteger(product.priceCents) && product.priceCents > 0).toBe(true)
      if (product.compareAtCents !== undefined) {
        expect(product.compareAtCents).toBeGreaterThan(product.priceCents)
      }
    }
  })

  it('keeps ratings, stock and review counts in range', () => {
    for (const product of PRODUCTS) {
      expect(product.rating).toBeGreaterThanOrEqual(0)
      expect(product.rating).toBeLessThanOrEqual(5)
      expect(Number.isInteger(product.stock) && product.stock >= 0).toBe(true)
      expect(Number.isInteger(product.reviewCount) && product.reviewCount >= 0).toBe(true)
    }
  })

  it('includes in-stock, low-stock and sold-out products so every stock state is exercised', () => {
    expect(PRODUCTS.some((product) => product.stock > 5)).toBe(true)
    expect(PRODUCTS.some((product) => product.stock > 0 && product.stock <= 5)).toBe(true)
    expect(PRODUCTS.some((product) => product.stock === 0)).toBe(true)
  })

  it('looks categories up by id', () => {
    expect(getCategory('audio').name).toBe('Audio')
    expect(isCategoryId('toasters')).toBe(false)
    expect(isCategoryId(null)).toBe(false)
  })
})
