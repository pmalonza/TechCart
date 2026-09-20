import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { ChevronDownIcon } from './icons'

/** Desktop "Categories" dropdown: a disclosure button that reveals a list of category links. */
export default function CategoriesMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { pathname, search } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname, search])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="nav-link dropdown-toggle"
        aria-expanded={open}
        aria-controls="categories-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Categories
        <ChevronDownIcon className="dropdown-chevron" />
      </button>
      {open && (
        <ul id="categories-menu" className="dropdown-menu">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link to={`/products?category=${category.id}`}>
                <strong>{category.name}</strong>
                <span>{category.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
