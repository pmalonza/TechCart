import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProduct, getAllColors } from './products'
import { getCategory, getSubcategory } from './categories'

describe('getProduct', () => {
  it('finds a product by id', () => {
    expect(getProduct('phone-1').name).toContain('Nova')
  })

  it('returns null for an unknown id', () => {
    expect(getProduct('made-up')).toBeNull()
  })
})

describe('PRODUCTS', () => {
  it('every product references a real category and subcategory', () => {
    for (const product of PRODUCTS) {
      expect(getCategory(product.category)).not.toBeNull()
      expect(getSubcategory(product.category, product.subcategory)).not.toBeNull()
    }
  })

  it('every product has a positive price', () => {
    for (const product of PRODUCTS) {
      expect(product.price).toBeGreaterThan(0)
    }
  })

  it('has no duplicate ids', () => {
    const ids = PRODUCTS.map((product) => product.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every product has at least one color option', () => {
    for (const product of PRODUCTS) {
      expect(product.colors.length).toBeGreaterThan(0)
    }
  })

  it('every color has a valid hex value and no duplicate ids within a product', () => {
    for (const product of PRODUCTS) {
      const colorIds = product.colors.map((color) => color.id)
      expect(new Set(colorIds).size).toBe(colorIds.length)
      for (const color of product.colors) {
        expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('sizes, where present, have no duplicates', () => {
    for (const product of PRODUCTS) {
      if (!product.sizes) continue
      expect(new Set(product.sizes).size).toBe(product.sizes.length)
    }
  })
})

describe('getAllColors', () => {
  it('returns a deduplicated list of colors across the catalog', () => {
    const colors = getAllColors()
    const ids = colors.map((color) => color.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(colors.length).toBeGreaterThan(0)
  })

  it('includes colors from multiple products, not just the first one', () => {
    const colors = getAllColors()
    const ids = colors.map((color) => color.id)
    expect(ids).toContain('red')
    expect(ids).toContain('gold')
  })
})
