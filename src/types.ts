export type CategoryId = 'laptops' | 'phones' | 'audio' | 'wearables' | 'gaming' | 'accessories'

export interface Category {
  id: CategoryId
  name: string
  blurb: string
  hue: number
}

export interface Product {
  id: string
  name: string
  brand: string
  category: CategoryId
  /** Price in US cents, so money math stays in integers. */
  priceCents: number
  /** Original price in cents when the product is on sale. */
  compareAtCents?: number
  rating: number
  reviewCount: number
  stock: number
  description: string
  specs: string[]
  tags: string[]
  /** Hue (0-360) used to tint the generated product artwork. */
  hue: number
  /** Uploaded product photo as a data URL; generated artwork is used when absent. */
  image?: string
  /** Id of the account that listed the product (absent for the built-in catalog). */
  sellerId?: string
}
