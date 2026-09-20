import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import NewsletterForm from './NewsletterForm'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <NewsletterForm />

          <nav className="footer-links" aria-label="Footer">
            <div>
              <h2 className="footer-heading">Shop</h2>
              <ul>
                <li>
                  <Link to="/products">All products</Link>
                </li>
                {CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <Link to={`/products?category=${category.id}`}>{category.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="footer-heading">Your account</h2>
              <ul>
                <li>
                  <Link to="/account">My account</Link>
                </li>
                <li>
                  <Link to="/account/orders">Orders</Link>
                </li>
                <li>
                  <Link to="/wishlist">Wishlist</Link>
                </li>
                <li>
                  <Link to="/cart">Cart</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="footer-heading">Help &amp; legal</h2>
              <ul>
                <li>
                  <Link to="/help">Help</Link>
                </li>
                <li>
                  <Link to="/terms">Terms &amp; Conditions</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <p className="footer-note">&copy; {new Date().getFullYear()} TechCart. A demo storefront - no real orders are placed.</p>
      </div>
    </footer>
  )
}
