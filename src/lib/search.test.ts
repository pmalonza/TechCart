import { PRODUCTS } from '../data/products'
import { getSuggestions, normalize, searchProducts, tokenize } from './search'
import { productsUrl } from './urls'

const names = (query: string) => searchProducts(PRODUCTS, query).map((product) => product.name)

describe('tokenize and normalize', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalize('Café ÉCLAIR')).toBe('cafe eclair')
  })

  it('splits on punctuation and whitespace and drops empties', () => {
    expect(tokenize('  USB-C,  hub!! ')).toEqual(['usb', 'c', 'hub'])
    expect(tokenize('   ')).toEqual([])
  })
})

describe('searchProducts', () => {
  it('returns every product, unchanged, for an empty query', () => {
    expect(searchProducts(PRODUCTS, '')).toBe(PRODUCTS)
    expect(searchProducts(PRODUCTS, '   ')).toBe(PRODUCTS)
  })

  it('matches by product name, case-insensitively', () => {
    expect(names('AURORA X1')).toEqual(['Aurora X1'])
    expect(names('aurora x1')).toEqual(['Aurora X1'])
  })

  it('matches partial words at the start of a word', () => {
    expect(names('buds')).toContain('Zenith Buds Pro')
    expect(names('keyb')).toContain('Kestrel Mech Keyboard')
  })

  it('matches by brand', () => {
    const results = names('voltix')
    expect(results).toEqual(expect.arrayContaining(['Voltix Pad Pro', 'Voltix Console X', 'Voltix Strix 17']))
    expect(results.every((name) => name.startsWith('Voltix'))).toBe(true)
  })

  it('matches by category name', () => {
    const results = searchProducts(PRODUCTS, 'gaming')
    expect(results.filter((product) => product.category === 'gaming')).toHaveLength(4)
  })

  it('matches by tag', () => {
    expect(names('wireless')).toEqual(expect.arrayContaining(['Zenith Buds Pro', 'Voltix Pad Pro']))
  })

  it('matches words that only appear in a specification', () => {
    expect(names('thunderbolt')).toEqual(['Nimbus Pro 16'])
  })

  it('requires every term to match (AND semantics)', () => {
    expect(names('nimbus laptop')).toEqual(expect.arrayContaining(['Nimbus Air 14', 'Nimbus Pro 16']))
    expect(names('nimbus zenith')).toEqual([])
    expect(names('gaming laptop').every((name) => name !== 'Zenith Buds Pro')).toBe(true)
  })

  it('finds nothing for gibberish', () => {
    expect(names('zzzzqqq')).toEqual([])
  })

  it('ranks a name match above a match buried in the description', () => {
    // "Hub" is in the name of the USB-C Hub; other products only mention hubs (if at all) in prose.
    expect(names('hub')[0]).toBe('Lumen USB-C Hub 8-in-1')
  })

  it('ranks exact word matches above prefix matches', () => {
    const results = names('watch')
    expect(results[0]).toBe('Pulse Watch 4')
  })

  it('breaks score ties by rating', () => {
    const results = searchProducts(PRODUCTS, 'smartphone')
    const ratings = results.map((product) => product.rating)
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a))
  })

  it('ignores punctuation in the query', () => {
    expect(names('usb-c hub')).toContain('Lumen USB-C Hub 8-in-1')
    expect(names('usb c hub')).toContain('Lumen USB-C Hub 8-in-1')
  })
})

describe('getSuggestions', () => {
  it('returns nothing for a blank query', () => {
    expect(getSuggestions(PRODUCTS, '')).toEqual([])
    expect(getSuggestions(PRODUCTS, '  ')).toEqual([])
  })

  it('caps the number of suggestions', () => {
    expect(getSuggestions(PRODUCTS, 'a', 5).length).toBeLessThanOrEqual(5)
    expect(getSuggestions(PRODUCTS, 'nimbus', 2)).toHaveLength(2)
  })
})

describe('productsUrl', () => {
  it('omits empty options', () => {
    expect(productsUrl()).toBe('/products')
    expect(productsUrl({ category: null, query: '  ' })).toBe('/products')
  })

  it('encodes the category and query', () => {
    expect(productsUrl({ category: 'audio' })).toBe('/products?category=audio')
    expect(productsUrl({ query: 'usb c & hub' })).toBe('/products?q=usb+c+%26+hub')
    expect(productsUrl({ category: 'audio', query: 'buds' })).toBe('/products?category=audio&q=buds')
  })
})
