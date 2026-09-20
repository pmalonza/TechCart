import type { Category, CategoryId } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'laptops', name: 'Laptops', blurb: 'Ultralights, creator machines and gaming rigs.', hue: 235 },
  { id: 'phones', name: 'Phones', blurb: 'Flagships, foldables and great-value handsets.', hue: 285 },
  { id: 'audio', name: 'Audio', blurb: 'Earbuds, headphones and speakers.', hue: 175 },
  { id: 'wearables', name: 'Wearables', blurb: 'Watches, bands, rings and smart glasses.', hue: 20 },
  { id: 'gaming', name: 'Gaming', blurb: 'Controllers, handhelds and keyboards.', hue: 345 },
  { id: 'accessories', name: 'Accessories', blurb: 'Hubs, chargers, power banks and sleeves.', hue: 140 },
]

export function isCategoryId(value: string | null | undefined): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value)
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((category) => category.id === id)!
}
