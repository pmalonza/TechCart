import { SORT_KEYS, sortLabel, type SortKey } from '../lib/filters'

interface SortSelectProps {
  value: SortKey
  hasQuery: boolean
  onChange: (next: SortKey) => void
}

export default function SortSelect({ value, hasQuery, onChange }: SortSelectProps) {
  return (
    <div className="sort-select">
      <label htmlFor="sort-select">Sort by</label>
      <select id="sort-select" value={value} onChange={(event) => onChange(event.target.value as SortKey)}>
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {sortLabel(key, hasQuery)}
          </option>
        ))}
      </select>
    </div>
  )
}
