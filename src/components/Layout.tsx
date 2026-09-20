import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Logo from './Logo'

function ResetScrollOnNavigation() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <div className="app-shell">
      <ResetScrollOnNavigation />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">
            <Logo className="brand-mark" />
            TechCart
          </Link>
        </div>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} TechCart. A demo storefront - no real orders are placed.</p>
        </div>
      </footer>
    </div>
  )
}
