import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProduct, getAllColors, getOnSaleProducts } from './products'
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

  it('every product has at least one spec with a label and value', () => {
    for (const product of PRODUCTS) {
      expect(product.specs.length).toBeGreaterThan(0)
      for (const spec of product.specs) {
        expect(spec.label.length).toBeGreaterThan(0)
        expect(spec.value.length).toBeGreaterThan(0)
      }
    }
  })

  it('has no duplicate spec labels within a product', () => {
    for (const product of PRODUCTS) {
      const labels = product.specs.map((spec) => spec.label)
      expect(new Set(labels).size).toBe(labels.length)
    }
  })

  it('originalPrice, where present, is greater than the current price', () => {
    for (const product of PRODUCTS) {
      if (product.originalPrice === undefined) continue
      expect(product.originalPrice).toBeGreaterThan(product.price)
    }
  })
})

describe('getOnSaleProducts', () => {
  it('returns only products with an originalPrice greater than price', () => {
    const onSale = getOnSaleProducts()
    expect(onSale.length).toBeGreaterThan(0)
    for (const product of onSale) {
      expect(product.originalPrice).toBeGreaterThan(product.price)
    }
  })

  it('excludes products with no originalPrice', () => {
    const onSale = getOnSaleProducts()
    const ids = onSale.map((product) => product.id)
    expect(ids).not.toContain('ref-3')
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
