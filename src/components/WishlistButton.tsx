import { useAnnounce } from '../context/AnnouncerContext'
import { useWishlist } from '../context/WishlistContext'
import type { Product } from '../types'
import { HeartIcon } from './icons'

interface WishlistButtonProps {
  product: Pick<Product, 'id' | 'name'>
  /** "icon" is a round heart for product cards; "full" is a labelled button for the product page. */
  variant?: 'icon' | 'full'
}

/** A toggle for saving a product to the wishlist. */
export default function WishlistButton({ product, variant = 'icon' }: WishlistButtonProps) {
  const { has, toggle } = useWishlist()
  const announce = useAnnounce()
  const saved = has(product.id)

  function handleClick() {
    toggle(product.id)
    announce(saved ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`)
  }

  if (variant === 'full') {
    return (
      <button type="button" className="btn wishlist-full" aria-pressed={saved} onClick={handleClick}>
        <HeartIcon filled={saved} className="btn-icon" />
        {saved ? 'Saved to wishlist' : 'Save to wishlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      className="wishlist-icon"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      onClick={handleClick}
    >
      <HeartIcon filled={saved} />
    </button>
  )
}
