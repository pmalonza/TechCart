import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { getCategory } from '../data/categories'
import { formatPrice } from '../lib/money'
import { getSuggestions } from '../lib/search'
import { productsUrl } from '../lib/urls'
import { CloseIcon, SearchIcon } from './icons'

/**
 * Site-wide product search: a combobox with live suggestions. Enter searches
 * (or opens the highlighted suggestion); arrow keys move through suggestions;
 * Escape closes the list.
 */
export default function SearchBar() {
  const navigate = useNavigate()
  const { products } = useProducts()
  const [params] = useSearchParams()
  const urlQuery = params.get('q') ?? ''

  const [value, setValue] = useState(urlQuery)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  // Keep the box in step with the URL (e.g. after following a link, or leaving the results page).
  useEffect(() => {
    setValue(urlQuery)
    setOpen(false)
  }, [urlQuery])

  const suggestions = getSuggestions(products, value)
  const hasQuery = value.trim().length > 0
  // The last option is always "see all results", so there is one more option than suggestions.
  const optionCount = suggestions.length > 0 ? suggestions.length + 1 : 0
  const showList = open && hasQuery

  function search(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    setActiveIndex(-1)
    navigate(productsUrl({ query: trimmed }))
  }

  function openProduct(id: string) {
    setOpen(false)
    setActiveIndex(-1)
    navigate(`/products/${id}`)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      openProduct(suggestions[activeIndex].id)
    } else {
      search(value)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!hasQuery) return
      setOpen(true)
      if (optionCount > 0) setActiveIndex((index) => (index + 1) % optionCount)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!hasQuery) return
      setOpen(true)
      if (optionCount > 0) setActiveIndex((index) => (index <= 0 ? optionCount - 1 : index - 1))
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
      }
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="search" ref={rootRef} onBlur={handleBlur}>
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor={`${listId}-input`} className="visually-hidden">
          Search products
        </label>
        <SearchIcon className="search-icon" />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          className="search-input"
          placeholder="Search laptops, phones, audio..."
          autoComplete="off"
          value={value}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => {
              setValue('')
              setActiveIndex(-1)
              inputRef.current?.focus()
              if (urlQuery) navigate(productsUrl())
            }}
          >
            <CloseIcon />
          </button>
        )}
      </form>

      {showList && (
        <ul id={listId} className="search-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestions.length === 0 && (
            <li className="search-empty" role="presentation">
              No matches for &ldquo;{value.trim()}&rdquo;
            </li>
          )}
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className="search-option"
              onMouseDown={(event) => {
                event.preventDefault()
                openProduct(product.id)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="search-option-name">{product.name}</span>
              <span className="search-option-meta">
                {getCategory(product.category).name} &middot; {formatPrice(product.priceCents)}
              </span>
            </li>
          ))}
          {suggestions.length > 0 && (
            <li
              id={`${listId}-option-${suggestions.length}`}
              role="option"
              aria-selected={activeIndex === suggestions.length}
              className="search-option search-all"
              onMouseDown={(event) => {
                event.preventDefault()
                search(value)
              }}
              onMouseEnter={() => setActiveIndex(suggestions.length)}
            >
              See all results for &ldquo;{value.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
