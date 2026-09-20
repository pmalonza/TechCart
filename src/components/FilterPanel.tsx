import { useEffect, useState, type FormEvent } from 'react'
import { centsToInput, parseDollars, type BrandFacet, type Filters } from '../lib/filters'

interface FilterPanelProps {
  id: string
  facets: BrandFacet[]
  filters: Filters
  activeCount: number
  onChange: (next: Filters) => void
  onClear: () => void
}

const RATING_OPTIONS = [
  { value: null, label: 'Any rating' },
  { value: 4, label: '4 stars & up' },
  { value: 3, label: '3 stars & up' },
] as const

export default function FilterPanel({ id, facets, filters, activeCount, onChange, onClear }: FilterPanelProps) {
  const [minText, setMinText] = useState(centsToInput(filters.minPriceCents))
  const [maxText, setMaxText] = useState(centsToInput(filters.maxPriceCents))

  // Keep the price boxes in step when the filters change from elsewhere (chips, "clear all", the URL).
  useEffect(() => {
    setMinText(centsToInput(filters.minPriceCents))
    setMaxText(centsToInput(filters.maxPriceCents))
  }, [filters.minPriceCents, filters.maxPriceCents])

  function toggleBrand(brand: string, checked: boolean) {
    const others = filters.brands.filter((item) => item.toLowerCase() !== brand.toLowerCase())
    onChange({ ...filters, brands: checked ? [...others, brand] : others })
  }

  function applyPrice(event: FormEvent) {
    event.preventDefault()
    onChange({ ...filters, minPriceCents: parseDollars(minText), maxPriceCents: parseDollars(maxText) })
  }

  const selectedBrands = new Set(filters.brands.map((brand) => brand.toLowerCase()))

  return (
    <aside id={id} className="filters" aria-label="Filters">
      <div className="filters-head">
        <h2>Filters</h2>
        {activeCount > 0 && (
          <button type="button" className="btn-link" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <fieldset className="filter-group">
        <legend>Brand</legend>
        {facets.length === 0 && <p className="muted">No brands to show.</p>}
        {facets.map((facet) => (
          <label key={facet.brand} className="check">
            <input
              type="checkbox"
              checked={selectedBrands.has(facet.brand.toLowerCase())}
              onChange={(event) => toggleBrand(facet.brand, event.target.checked)}
            />
            <span>{facet.brand}</span>
            <span className="check-count">{facet.count}</span>
          </label>
        ))}
      </fieldset>

      <form className="filter-group" onSubmit={applyPrice} aria-label="Price range">
        <p className="filter-legend">Price</p>
        <div className="price-range">
          <div className="field">
            <label htmlFor={`${id}-min`}>Min ($)</label>
            <input
              id={`${id}-min`}
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0"
              value={minText}
              onChange={(event) => setMinText(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-max`}>Max ($)</label>
            <input
              id={`${id}-max`}
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="Any"
              value={maxText}
              onChange={(event) => setMaxText(event.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-sm">
          Apply price
        </button>
      </form>

      <fieldset className="filter-group">
        <legend>Rating</legend>
        {RATING_OPTIONS.map((option) => (
          <label key={option.label} className="check">
            <input
              type="radio"
              name={`${id}-rating`}
              checked={filters.minRating === option.value}
              onChange={() => onChange({ ...filters, minRating: option.value })}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Availability &amp; deals</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(event) => onChange({ ...filters, inStockOnly: event.target.checked })}
          />
          <span>In stock only</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(event) => onChange({ ...filters, onSaleOnly: event.target.checked })}
          />
          <span>On sale</span>
        </label>
      </fieldset>
    </aside>
  )
}
