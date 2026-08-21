import { useState } from 'react'

export default function SearchBar({ query, onSearch }) {
  const [draft, setDraft] = useState(query)

  function handleSubmit(event) {
    event.preventDefault()
    onSearch(draft.trim())
  }

  function handleClear() {
    setDraft('')
    onSearch('')
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="product-search">Search products</label>
      <input
        id="product-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search products…"
      />
      <button type="submit" className="add-button">
        Search
      </button>
      {query && (
        <button type="button" className="text-button" onClick={handleClear}>
          Clear search
        </button>
      )}
    </form>
  )
}
