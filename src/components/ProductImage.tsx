import { useId } from 'react'
import type { CategoryId, Product } from '../types'

type ImageSource = Pick<Product, 'name' | 'category' | 'hue' | 'image'>

interface Palette {
  ink: string
  mid: string
  light: string
}

function Artwork({ category, palette }: { category: CategoryId; palette: Palette }) {
  const { ink, mid, light } = palette
  switch (category) {
    case 'laptops':
      return (
        <>
          <rect x="42" y="52" width="116" height="78" rx="7" fill={ink} />
          <rect x="49" y="59" width="102" height="64" rx="3" fill={mid} />
          <path d="M28 138h144l-8 12a6 6 0 0 1-5 3H41a6 6 0 0 1-5-3z" fill={ink} />
          <rect x="88" y="138" width="24" height="4" rx="2" fill={light} opacity="0.5" />
        </>
      )
    case 'phones':
      return (
        <>
          <rect x="68" y="28" width="64" height="144" rx="14" fill={ink} />
          <rect x="74" y="38" width="52" height="118" rx="7" fill={mid} />
          <circle cx="100" cy="33.5" r="2" fill={light} />
          <rect x="90" y="162" width="20" height="3" rx="1.5" fill={light} opacity="0.6" />
        </>
      )
    case 'audio':
      return (
        <>
          <path d="M52 118V102a48 48 0 0 1 96 0v16" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" />
          <rect x="40" y="108" width="26" height="46" rx="12" fill={ink} />
          <rect x="134" y="108" width="26" height="46" rx="12" fill={ink} />
          <rect x="46" y="116" width="14" height="30" rx="7" fill={mid} />
          <rect x="140" y="116" width="14" height="30" rx="7" fill={mid} />
        </>
      )
    case 'wearables':
      return (
        <>
          <rect x="80" y="20" width="40" height="44" rx="8" fill={mid} />
          <rect x="80" y="136" width="40" height="44" rx="8" fill={mid} />
          <rect x="60" y="52" width="80" height="96" rx="22" fill={ink} />
          <rect x="67" y="59" width="66" height="82" rx="16" fill={light} />
          <path d="M100 78v24l14 10" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="140" y="88" width="6" height="16" rx="3" fill={ink} />
        </>
      )
    case 'gaming':
      return (
        <>
          <path
            d="M56 78h88c14 0 22 10 26 34l6 32c2 12-6 20-16 20-8 0-12-5-18-14l-6-8H74l-6 8c-6 9-10 14-18 14-10 0-18-8-16-20l6-32c4-24 12-34 26-34z"
            fill={ink}
          />
          <rect x="66" y="96" width="24" height="8" rx="3" fill={light} />
          <rect x="74" y="88" width="8" height="24" rx="3" fill={light} />
          <circle cx="126" cy="94" r="6" fill={mid} />
          <circle cx="142" cy="104" r="6" fill={mid} />
          <circle cx="96" cy="122" r="7" fill={mid} />
          <circle cx="118" cy="122" r="7" fill={mid} />
        </>
      )
    case 'accessories':
      return (
        <>
          <rect x="62" y="40" width="76" height="112" rx="14" fill={ink} />
          <rect x="70" y="52" width="60" height="14" rx="4" fill={mid} />
          <rect x="70" y="78" width="44" height="6" rx="3" fill={light} opacity="0.8" />
          <rect x="70" y="90" width="32" height="6" rx="3" fill={light} opacity="0.5" />
          <rect x="88" y="152" width="24" height="10" rx="3" fill={mid} />
          <path d="M100 162c0 16 30 12 30 28" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
        </>
      )
  }
}

/** A product photo when one was uploaded, otherwise generated artwork tinted by the product's hue. */
export default function ProductImage({ product, className }: { product: ImageSource; className?: string }) {
  const gradientId = useId()

  if (product.image) {
    return <img className={`product-photo ${className ?? ''}`.trim()} src={product.image} alt={product.name} loading="lazy" />
  }

  const { hue } = product
  const palette: Palette = {
    ink: `hsl(${hue} 45% 28%)`,
    mid: `hsl(${hue} 50% 58%)`,
    light: `hsl(${hue} 60% 96%)`,
  }

  return (
    <svg
      className={`product-art ${className ?? ''}`.trim()}
      viewBox="0 0 200 200"
      role="img"
      aria-label={product.name}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 80% 94%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 70% 82%)`} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradientId})`} />
      <Artwork category={product.category} palette={palette} />
    </svg>
  )
}
