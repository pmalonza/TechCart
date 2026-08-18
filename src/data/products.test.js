import { describe, expect, it } from 'vitest'
import { PRODUCTS, getProduct } from './products'
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
})
