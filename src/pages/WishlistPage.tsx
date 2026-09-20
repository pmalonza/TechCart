import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ProductGrid from '../components/ProductGrid'
import { useAnnounce } from '../context/AnnouncerContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { maxQuantity } from '../lib/cart'

export default function WishlistPage() {
  const { items, clear } = useWishlist()
  const { add, getQuantity } = useCart()
  const announce = useAnnounce()
  useDocumentTitle('Your wishlist')

  // Only items that are in stock and not already in the cart, so pressing the button twice never inflates quantities.
  const addable = items.filter((product) => maxQuantity(product) > 0 && getQuantity(product.id) === 0)

  function addAllToCart() {
    for (const product of addable) add(product, 1)
    announce(`${addable.length} ${addable.length === 1 ? 'item' : 'items'} added to cart`)
  }

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="page-top">
          <BackButton fallback="/products" />
        </div>
        <div className="empty-state">
          <h1>Your wishlist is empty</h1>
          <p>Tap the heart on any product to save it here for later.</p>
          <Link className="btn btn-primary" to="/products">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <div className="page-top">
        <BackButton fallback="/products" />
      </div>
      <header className="page-header">
        <h1>Your wishlist</h1>
        <p>
          {items.length} saved {items.length === 1 ? 'item' : 'items'}
        </p>
      </header>

      <div className="wishlist-actions">
        <button type="button" className="btn btn-primary btn-sm" disabled={addable.length === 0} onClick={addAllToCart}>
          Add all available to cart
        </button>
        <button type="button" className="btn-link" onClick={clear}>
          Clear wishlist
        </button>
      </div>

      <ProductGrid products={items} label="Wishlist" />
    </div>
  )
}
