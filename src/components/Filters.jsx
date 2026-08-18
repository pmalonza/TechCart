import { getAllColors } from '../data/products'

export default function Filters({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, selectedColor, onSelectColor }) {
  const colors = getAllColors()

  return (
    <div className="filters">
      <div className="filters-price">
        <div className="field">
          <label htmlFor="filter-min-price">Min price</label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            placeholder="$0"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-max-price">Max price</label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            placeholder="No max"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
          />
        </div>
      </div>
      <fieldset className="filters-colors">
        <legend className="filters-colors-label">Color</legend>
        <div className="color-swatches">
          <button
            type="button"
            className={selectedColor === null ? 'color-swatch-all color-swatch-all-active' : 'color-swatch-all'}
            aria-pressed={selectedColor === null}
            onClick={() => onSelectColor(null)}
          >
            All
          </button>
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              className={
                selectedColor === color.id ? 'color-swatch color-swatch-active' : 'color-swatch'
              }
              style={{ backgroundColor: color.hex }}
              aria-pressed={selectedColor === color.id}
              aria-label={color.label}
              title={color.label}
              onClick={() => onSelectColor(color.id)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  )
}
