import { beforeEach, describe, expect, it } from 'vitest'
import { getProductImage, removeProductImage, saveProductImage } from './productImages'

describe('product image overrides', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns null when no image has been uploaded', () => {
    expect(getProductImage('tv-1')).toBeNull()
  })

  it('saves and retrieves an uploaded image', () => {
    saveProductImage('tv-1', 'data:image/png;base64,abc123')
    expect(getProductImage('tv-1')).toBe('data:image/png;base64,abc123')
  })

  it('keeps images for different products separate', () => {
    saveProductImage('tv-1', 'data:image/png;base64,tv')
    saveProductImage('lap-1', 'data:image/png;base64,laptop')

    expect(getProductImage('tv-1')).toBe('data:image/png;base64,tv')
    expect(getProductImage('lap-1')).toBe('data:image/png;base64,laptop')
  })

  it('removes an uploaded image', () => {
    saveProductImage('tv-1', 'data:image/png;base64,abc123')
    removeProductImage('tv-1')
    expect(getProductImage('tv-1')).toBeNull()
  })
})
