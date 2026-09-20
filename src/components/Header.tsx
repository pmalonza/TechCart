import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import CategoriesMenu from './CategoriesMenu'
import { CloseIcon, MenuIcon } from './icons'
import Logo from './Logo'
import SearchBar from './SearchBar'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

/** Primary navigation. Later features append their own entries here. */
const MAIN_NAV: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Shop' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link'
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { pathname, search } = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, search])

  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="container header-bar">
        <Link to="/" className="brand">
          <Logo className="brand-mark" />
          TechCart
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
          <CategoriesMenu />
        </nav>

        <SearchBar />

        <div className="header-actions">
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-btn menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          <div className="container">
            <ul>
              {MAIN_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={navLinkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <p className="mobile-menu-heading">Categories</p>
            <ul>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link className="nav-link" to={`/products?category=${category.id}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
