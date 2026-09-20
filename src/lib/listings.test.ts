import { PRODUCTS } from '../data/products'
import type { Product } from '../types'
import {
  MAX_LISTINGS_PER_USER,
  buildListing,
  canAddListing,
  emptyListingInput,
  listingsBySeller,
  parseKeywords,
  parseSpecs,
  sanitizeListings,
  validateListing,
  withListingImage,
  withoutListing,
  withoutSeller,
  type ListingInput,
} from './listings'

const IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='

function valid(overrides: Partial<ListingInput> = {}): ListingInput {
  return {
    name: 'Trail Bluetooth Speaker',
    brand: 'Trailhead',
    category: 'audio',
    price: '59.99',
    comparePrice: '',
    stock: '12',
    description: 'A rugged waterproof speaker that lasts a whole weekend on one charge.',
    specs: 'IP67 waterproof\n20 hour battery',
    keywords: 'Outdoor, portable, outdoor',
    ...overrides,
  }
}

function listing(id: string, sellerId: string): Product {
  return buildListing(valid({ name: `Item ${id}` }), sellerId, id)
}

describe('parseSpecs and parseKeywords', () => {
  it('splits specs by line and drops blanks', () => {
    expect(parseSpecs(' one \n\n two\r\nthree ')).toEqual(['one', 'two', 'three'])
  })

  it('lowercases, trims and de-duplicates keywords', () => {
    expect(parseKeywords('Outdoor, portable ,, OUTDOOR')).toEqual(['outdoor', 'portable'])
  })
})

describe('validateListing', () => {
  it('accepts a complete listing', () => {
    expect(validateListing(valid())).toEqual({})
  })

  it('requires every mandatory field', () => {
    const errors = validateListing(emptyListingInput())
    expect(Object.keys(errors).sort()).toEqual(['brand', 'category', 'description', 'name', 'price'])
  })

  it('checks name, brand and description lengths', () => {
    expect(validateListing(valid({ name: 'ab' })).name).toBeDefined()
    expect(validateListing(valid({ name: 'x'.repeat(81) })).name).toBeDefined()
    expect(validateListing(valid({ brand: 'x'.repeat(41) })).brand).toBeDefined()
    expect(validateListing(valid({ description: 'too short' })).description).toBeDefined()
    expect(validateListing(valid({ description: 'x'.repeat(1001) })).description).toBeDefined()
  })

  it('rejects an unknown category', () => {
    expect(validateListing(valid({ category: 'furniture' })).category).toBeDefined()
  })

  it('validates the price', () => {
    expect(validateListing(valid({ price: 'free' })).price).toBeDefined()
    expect(validateListing(valid({ price: '0' })).price).toMatch(/more than zero/)
    expect(validateListing(valid({ price: '100000.01' })).price).toMatch(/100,000/)
    expect(validateListing(valid({ price: '100000' })).price).toBeUndefined()
  })

  it('requires the original price to be higher than the price, when given', () => {
    expect(validateListing(valid({ comparePrice: '49.99' })).comparePrice).toMatch(/higher/)
    expect(validateListing(valid({ comparePrice: '59.99' })).comparePrice).toMatch(/higher/)
    expect(validateListing(valid({ comparePrice: 'lots' })).comparePrice).toBeDefined()
    expect(validateListing(valid({ comparePrice: '79.99' })).comparePrice).toBeUndefined()
  })

  it('requires stock to be a whole number from 1 to 999', () => {
    for (const stock of ['', 'abc', '1.5', '-1', '0', '1000']) expect(validateListing(valid({ stock })).stock, stock).toBeDefined()
    for (const stock of ['1', '999', ' 5 ']) expect(validateListing(valid({ stock })).stock, stock).toBeUndefined()
  })

  it('limits key features and keywords', () => {
    expect(validateListing(valid({ specs: Array.from({ length: 9 }, (_, i) => `f${i}`).join('\n') })).specs).toBeDefined()
    expect(validateListing(valid({ specs: 'x'.repeat(101) })).specs).toBeDefined()
    expect(validateListing(valid({ keywords: Array.from({ length: 9 }, (_, i) => `k${i}`).join(',') })).keywords).toBeDefined()
    expect(validateListing(valid({ keywords: 'x'.repeat(25) })).keywords).toBeDefined()
  })
})

describe('buildListing', () => {
  it('builds a product with cents, tags, category hue and no reviews', () => {
    const product = buildListing(valid({ comparePrice: '79.99', image: IMAGE }), 'seller-1', 'listing-1')
    expect(product).toMatchObject({
      id: 'listing-1',
      sellerId: 'seller-1',
      name: 'Trail Bluetooth Speaker',
      category: 'audio',
      priceCents: 5999,
      compareAtCents: 7999,
      stock: 12,
      rating: 0,
      reviewCount: 0,
      specs: ['IP67 waterproof', '20 hour battery'],
      tags: ['outdoor', 'portable'],
      image: IMAGE,
    })
  })

  it('leaves out the original price and photo when not given', () => {
    const product = buildListing(valid(), 's', 'l')
    expect('compareAtCents' in product).toBe(false)
    expect('image' in product).toBe(false)
  })

  it('gives a placeholder feature when none were entered', () => {
    expect(buildListing(valid({ specs: '' }), 's', 'l').specs).toHaveLength(1)
  })
})

describe('sanitizeListings', () => {
  const good = buildListing(valid({ image: IMAGE }), 'seller-1', 'listing-1')

  it('keeps valid listings unchanged', () => {
    expect(sanitizeListings([good])).toEqual([good])
  })

  it('returns an empty list for non-arrays', () => {
    for (const raw of [undefined, null, {}, 'x', 5]) expect(sanitizeListings(raw)).toEqual([])
  })

  it('drops malformed entries', () => {
    const broken = [
      null,
      'x',
      { ...good, id: '' },
      { ...good, sellerId: undefined },
      { ...good, category: 'furniture' },
      { ...good, priceCents: 0 },
      { ...good, priceCents: 12.5 },
      { ...good, priceCents: '5999' },
      { ...good, stock: -1 },
      { ...good, stock: 1000 },
      { ...good, specs: 'not a list' },
      { ...good, tags: [1, 2] },
      { ...good, name: 'x'.repeat(81) },
    ]
    expect(sanitizeListings(broken)).toEqual([])
  })

  it('drops repeated ids and ids that collide with the built-in catalog', () => {
    const clash = { ...good, id: PRODUCTS[0].id }
    expect(sanitizeListings([good, { ...good, name: 'Copy' }, clash])).toEqual([good])
  })

  it('removes a photo that is not a safe image data URL but keeps the listing', () => {
    for (const image of ['javascript:alert(1)', 'https://example.com/x.jpg', 42]) {
      const [kept] = sanitizeListings([{ ...good, image }])
      expect(kept.name).toBe(good.name)
      expect('image' in kept).toBe(false)
    }
  })

  it('forces reviews to zero and ignores an invalid original price', () => {
    const [kept] = sanitizeListings([{ ...good, rating: 5, reviewCount: 9000, compareAtCents: 100 }])
    expect(kept.rating).toBe(0)
    expect(kept.reviewCount).toBe(0)
    expect('compareAtCents' in kept).toBe(false)
  })
})

describe('listing ownership helpers', () => {
  const a1 = listing('a1', 'alice')
  const a2 = listing('a2', 'alice')
  const b1 = listing('b1', 'bob')
  const all = [a1, a2, b1]

  it("finds a seller's own listings", () => {
    expect(listingsBySeller(all, 'alice')).toEqual([a1, a2])
    expect(listingsBySeller(all, 'nobody')).toEqual([])
  })

  it('enforces the per-account limit', () => {
    const many = Array.from({ length: MAX_LISTINGS_PER_USER }, (_, i) => listing(`m${i}`, 'carol'))
    expect(canAddListing(many, 'carol')).toBe(false)
    expect(canAddListing(many.slice(1), 'carol')).toBe(true)
    expect(canAddListing(many, 'dave')).toBe(true)
  })

  it("sets and clears a photo only on the seller's own listing", () => {
    expect(withListingImage(all, 'a1', 'alice', IMAGE).find((p) => p.id === 'a1')?.image).toBe(IMAGE)
    expect(withListingImage(all, 'a1', 'bob', IMAGE)).toEqual(all)
    const withPhoto = withListingImage(all, 'a1', 'alice', IMAGE)
    expect('image' in withListingImage(withPhoto, 'a1', 'alice', undefined).find((p) => p.id === 'a1')!).toBe(false)
  })

  it("deletes only the seller's own listing", () => {
    expect(withoutListing(all, 'a1', 'alice')).toEqual([a2, b1])
    expect(withoutListing(all, 'a1', 'bob')).toEqual(all)
  })

  it('removes every listing of a seller', () => {
    expect(withoutSeller(all, 'alice')).toEqual([b1])
  })
})
