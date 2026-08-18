import { describe, expect, it } from 'vitest'
import { CATEGORIES, getCategory, getSubcategory } from './categories'

describe('getCategory', () => {
  it('finds a category by id', () => {
    expect(getCategory('phones').label).toBe('Phones')
  })

  it('returns null for an unknown id', () => {
    expect(getCategory('made-up')).toBeNull()
  })
})

describe('getSubcategory', () => {
  it('finds a subcategory under its parent category', () => {
    expect(getSubcategory('electronics', 'tvs').label).toBe('TVs')
  })

  it('returns null for an unknown subcategory id', () => {
    expect(getSubcategory('electronics', 'made-up')).toBeNull()
  })

  it('returns null when the parent category does not exist', () => {
    expect(getSubcategory('made-up', 'tvs')).toBeNull()
  })
})

describe('CATEGORIES', () => {
  it('every category has at least one subcategory', () => {
    for (const category of CATEGORIES) {
      expect(category.subcategories.length).toBeGreaterThan(0)
    }
  })
})
