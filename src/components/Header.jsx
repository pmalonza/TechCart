export default function Header({ cartCount = 0, onViewCart }) {
  return (
    <header className="app-header">
      <h1>TechCart</h1>
      <button type="button" className="cart-button" onClick={onViewCart}>
        Cart{cartCount > 0 ? ` (${cartCount})` : ''}
      </button>
    </header>
  )
}
