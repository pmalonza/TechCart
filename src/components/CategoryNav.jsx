import { CATEGORIES, getCategory } from '../data/categories'

export default function CategoryNav({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}) {
  const activeCategory = selectedCategory ? getCategory(selectedCategory) : null

  return (
    <nav className="category-nav" aria-label="Product categories">
      <ul className="category-nav-list">
        <li>
          <button
            type="button"
            className={selectedCategory === null ? 'category-chip category-chip-active' : 'category-chip'}
            aria-pressed={selectedCategory === null}
            onClick={() => onSelectCategory(null)}
          >
            All products
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={
                selectedCategory === category.id ? 'category-chip category-chip-active' : 'category-chip'
              }
              aria-pressed={selectedCategory === category.id}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.label}
            </button>
          </li>
        ))}
      </ul>
      {activeCategory && (
        <ul className="subcategory-nav-list">
          <li>
            <button
              type="button"
              className={
                selectedSubcategory === null
                  ? 'subcategory-chip subcategory-chip-active'
                  : 'subcategory-chip'
              }
              aria-pressed={selectedSubcategory === null}
              onClick={() => onSelectSubcategory(null)}
            >
              All {activeCategory.label}
            </button>
          </li>
          {activeCategory.subcategories.map((sub) => (
            <li key={sub.id}>
              <button
                type="button"
                className={
                  selectedSubcategory === sub.id
                    ? 'subcategory-chip subcategory-chip-active'
                    : 'subcategory-chip'
                }
                aria-pressed={selectedSubcategory === sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
              >
                {sub.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
