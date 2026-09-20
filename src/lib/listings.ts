import { CATEGORIES, getCategory, isCategoryId } from '../data/categories'
import { PRODUCTS } from '../data/products'
import type { Product } from '../types'
import { isSafeImageDataUrl } from './image'
import { parsePriceToCents } from './money'

/** How many products one account may list. Photos are stored in the browser, so this keeps storage in check. */
export const MAX_LISTINGS_PER_USER = 10

export const MAX_PRICE_CENTS = 10_000_000
export const MAX_STOCK = 999
const MAX_SPECS = 8
const MAX_KEYWORDS = 8

/** The listing form as typed: everything is a string until it has been validated. */
export interface ListingInput {
  name: string
  brand: string
  category: string
  price: string
  comparePrice: string
  stock: string
  description: string
  /** One key feature per line. */
  specs: string
  /** Comma-separated search keywords. */
  keywords: string
  /** Photo as a data URL, if one was uploaded. */
  image?: string
}

export type ListingErrors = Partial<Record<Exclude<keyof ListingInput, 'image'>, string>>

export function emptyListingInput(): ListingInput {
  return { name: '', brand: '', category: '', price: '', comparePrice: '', stock: '1', description: '', specs: '', keywords: '' }
}

export function parseSpecs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function parseKeywords(text: string): string[] {
  const seen = new Set<string>()
  for (const word of text.split(',')) {
    const keyword = word.trim().toLowerCase()
    if (keyword) seen.add(keyword)
  }
  return [...seen]
}

export function validateListing(input: ListingInput): ListingErrors {
  const errors: ListingErrors = {}

  const name = input.name.trim()
  if (name.length < 3) errors.name = 'Enter a product name of at least 3 characters.'
  else if (name.length > 80) errors.name = 'Keep the product name to 80 characters or fewer.'

  const brand = input.brand.trim()
  if (brand.length < 2) errors.brand = 'Enter the brand or maker.'
  else if (brand.length > 40) errors.brand = 'Keep the brand to 40 characters or fewer.'

  if (!isCategoryId(input.category)) errors.category = 'Choose a category.'

  const price = parsePriceToCents(input.price)
  if (price === null) errors.price = 'Enter a price like 49.99.'
  else if (price <= 0) errors.price = 'The price must be more than zero.'
  else if (price > MAX_PRICE_CENTS) errors.price = 'The price cannot be more than $100,000.'

  if (input.comparePrice.trim() !== '') {
    const compare = parsePriceToCents(input.comparePrice)
    if (compare === null) errors.comparePrice = 'Enter the original price like 59.99, or leave it empty.'
    else if (compare > MAX_PRICE_CENTS) errors.comparePrice = 'The price cannot be more than $100,000.'
    else if (price !== null && compare <= price) errors.comparePrice = 'The original price must be higher than the selling price.'
  }

  if (!/^\d+$/.test(input.stock.trim())) errors.stock = 'Enter how many you have, as a whole number.'
  else {
    const stock = Number(input.stock.trim())
    if (stock < 1) errors.stock = 'You need at least 1 in stock to list a product.'
    else if (stock > MAX_STOCK) errors.stock = `Stock cannot be more than ${MAX_STOCK}.`
  }

  const description = input.description.trim()
  if (description.length < 20) errors.description = 'Describe the product in at least 20 characters.'
  else if (description.length > 1000) errors.description = 'Keep the description to 1,000 characters or fewer.'

  const specs = parseSpecs(input.specs)
  if (specs.length > MAX_SPECS) errors.specs = `List at most ${MAX_SPECS} key features.`
  else if (specs.some((spec) => spec.length > 100)) errors.specs = 'Keep each key feature to 100 characters or fewer.'

  const keywords = parseKeywords(input.keywords)
  if (keywords.length > MAX_KEYWORDS) errors.keywords = `Use at most ${MAX_KEYWORDS} keywords.`
  else if (keywords.some((keyword) => keyword.length > 24)) errors.keywords = 'Keep each keyword to 24 characters or fewer.'

  return errors
}

/** Builds the catalog product for a listing. The input must already have passed `validateListing`. */
export function buildListing(input: ListingInput, sellerId: string, id: string): Product {
  const category = getCategory(input.category as Product['category'])
  const priceCents = parsePriceToCents(input.price)!
  const compareAtCents = input.comparePrice.trim() === '' ? undefined : parsePriceToCents(input.comparePrice)!
  const specs = parseSpecs(input.specs)
  return {
    id,
    name: input.name.trim(),
    brand: input.brand.trim(),
    category: category.id,
    priceCents,
    ...(compareAtCents !== undefined && { compareAtCents }),
    rating: 0,
    reviewCount: 0,
    stock: Number(input.stock.trim()),
    description: input.description.trim(),
    specs: specs.length > 0 ? specs : ['No key features listed'],
    tags: parseKeywords(input.keywords),
    hue: category.hue,
    ...(input.image !== undefined && { image: input.image }),
    sellerId,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function boundedString(value: unknown, max: number, min = 1): string | null {
  return typeof value === 'string' && value.length >= min && value.length <= max ? value : null
}

function stringList(value: unknown, maxItems: number, maxLength: number): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null
  return value.every((item) => typeof item === 'string' && item.length > 0 && item.length <= maxLength) ? (value as string[]) : null
}

function sanitizeListing(raw: unknown): Product | null {
  if (!isRecord(raw)) return null
  const id = boundedString(raw.id, 64)
  const sellerId = boundedString(raw.sellerId, 64)
  const name = boundedString(raw.name, 80)
  const brand = boundedString(raw.brand, 40)
  const description = boundedString(raw.description, 1000)
  const specs = stringList(raw.specs, MAX_SPECS, 100)
  const tags = stringList(raw.tags, MAX_KEYWORDS, 24)
  if (!id || !sellerId || !name || !brand || !description || !specs || !tags) return null
  if (typeof raw.category !== 'string' || !isCategoryId(raw.category)) return null

  const { priceCents, stock, compareAtCents } = raw
  if (typeof priceCents !== 'number' || !Number.isInteger(priceCents) || priceCents <= 0 || priceCents > MAX_PRICE_CENTS) return null
  if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK) return null
  const hasCompare =
    typeof compareAtCents === 'number' && Number.isInteger(compareAtCents) && compareAtCents > priceCents && compareAtCents <= MAX_PRICE_CENTS

  return {
    id,
    name,
    brand,
    category: raw.category,
    priceCents,
    ...(hasCompare && { compareAtCents }),
    rating: 0,
    reviewCount: 0,
    stock,
    description,
    specs,
    tags,
    hue: getCategory(raw.category).hue,
    ...(isSafeImageDataUrl(raw.image) && { image: raw.image }),
    sellerId,
  }
}

/**
 * Turns untrusted stored data into valid listings. Malformed entries, repeated
 * ids and ids that would collide with the built-in catalog are dropped, and a
 * stored image is kept only if it is a small image data URL.
 */
export function sanitizeListings(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return []
  const taken = new Set(PRODUCTS.map((product) => product.id))
  const listings: Product[] = []
  for (const item of raw) {
    const listing = sanitizeListing(item)
    if (!listing || taken.has(listing.id)) continue
    taken.add(listing.id)
    listings.push(listing)
  }
  return listings
}

export function listingsBySeller(listings: Product[], sellerId: string): Product[] {
  return listings.filter((listing) => listing.sellerId === sellerId)
}

export function canAddListing(listings: Product[], sellerId: string): boolean {
  return listingsBySeller(listings, sellerId).length < MAX_LISTINGS_PER_USER
}

/** Sets or clears a listing's photo. Only the seller's own listing is changed. */
export function withListingImage(listings: Product[], id: string, sellerId: string, image: string | undefined): Product[] {
  return listings.map((listing) => {
    if (listing.id !== id || listing.sellerId !== sellerId) return listing
    const updated: Product = { ...listing }
    delete updated.image
    return image === undefined ? updated : { ...updated, image }
  })
}

/** Removes a listing. Only the seller's own listing is removed. */
export function withoutListing(listings: Product[], id: string, sellerId: string): Product[] {
  return listings.filter((listing) => !(listing.id === id && listing.sellerId === sellerId))
}

export function withoutSeller(listings: Product[], sellerId: string): Product[] {
  return listings.filter((listing) => listing.sellerId !== sellerId)
}

export const LISTING_CATEGORY_OPTIONS = [{ value: '', label: 'Choose a category' }, ...CATEGORIES.map((category) => ({ value: category.id, label: category.name }))]
