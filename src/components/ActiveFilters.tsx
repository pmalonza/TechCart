import { formatPrice } from '../lib/money'
import type { Filters } from '../lib/filters'
import { CloseIcon } from './icons'

interface ActiveFiltersProps {
  filters: Filters
  onChange: (next: Filters) => void
  onClear: () => void
}

function priceLabel(filters: Filters): string {
  const { minPriceCents: min, maxPriceCents: max } = filters
  if (min !== null && max !== null) return `${formatPrice(min)} - ${formatPrice(max)}`
  if (min !== null) return `From ${formatPrice(min)}`
  return `Up to ${formatPrice(max ?? 0)}`
}

/** A row of removable chips, one per active filter, plus "Clear all". Renders nothing when no filter is set. */
export default function ActiveFilters({ filters, onChange, onClear }: ActiveFiltersProps) {
  const chips: { key: string; label: string; remove: () => void }[] = []

  for (const brand of filters.brands) {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      remove: () => onChange({ ...filters, brands: filters.brands.filter((item) => item !== brand) }),
    })
  }
  if (filters.minPriceCents !== null || filters.maxPriceCents !== null) {
    chips.push({
      key: 'price',
      label: priceLabel(filters),
      remove: () => onChange({ ...filters, minPriceCents: null, maxPriceCents: null }),
    })
  }
  if (filters.minRating !== null) {
    chips.push({
      key: 'rating',
      label: `${filters.minRating} stars & up`,
      remove: () => onChange({ ...filters, minRating: null }),
    })
  }
  if (filters.inStockOnly) {
    chips.push({ key: 'stock', label: 'In stock', remove: () => onChange({ ...filters, inStockOnly: false }) })
  }
  if (filters.onSaleOnly) {
    chips.push({ key: 'sale', label: 'On sale', remove: () => onChange({ ...filters, onSaleOnly: false }) })
  }

  if (chips.length === 0) return null

  return (
    <ul className="active-filters" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <span className="filter-chip">
            {chip.label}
            <button type="button" aria-label={`Remove filter: ${chip.label}`} onClick={chip.remove}>
              <CloseIcon />
            </button>
          </span>
        </li>
      ))}
      <li>
        <button type="button" className="btn-link" onClick={onClear}>
          Clear all filters
        </button>
      </li>
    </ul>
  )
}
