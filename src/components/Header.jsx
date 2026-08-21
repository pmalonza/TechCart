export default function Header({
  cartCount = 0,
  wishlistCount = 0,
  onViewHome,
  onViewCart,
  onViewWishlist,
  onViewOrders,
  onViewHelp,
}) {
  return (
    <header className="app-header">
      <h1>TechCart</h1>
      <nav className="header-nav" aria-label="Main">
        <button type="button" className="cart-button" onClick={onViewHome}>
          Home
        </button>
        <button type="button" className="cart-button" onClick={onViewWishlist}>
          Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
        </button>
        <button type="button" className="cart-button" onClick={onViewOrders}>
          Orders
        </button>
        <button type="button" className="cart-button" onClick={onViewHelp}>
          Help
        </button>
        <button type="button" className="cart-button" onClick={onViewCart}>
          Cart{cartCount > 0 ? ` (${cartCount})` : ''}
        </button>
      </nav>
    </header>
  )
}
