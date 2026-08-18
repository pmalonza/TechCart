export const CATEGORIES = [
  {
    id: 'electronics',
    label: 'Electronics',
    subcategories: [
      { id: 'refrigerators', label: 'Refrigerators' },
      { id: 'tvs', label: 'TVs' },
      { id: 'vacuums', label: 'Vacuums' },
      { id: 'electronics-accessories', label: 'Accessories' },
    ],
  },
  {
    id: 'computers',
    label: 'Computers',
    subcategories: [
      { id: 'laptops', label: 'Laptops' },
      { id: 'computer-accessories', label: 'Accessories' },
    ],
  },
  {
    id: 'phones',
    label: 'Phones',
    subcategories: [
      { id: 'smartphones', label: 'Smartphones' },
      { id: 'phone-accessories', label: 'Accessories' },
    ],
  },
]

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? null
}

export function getSubcategory(categoryId, subcategoryId) {
  const category = getCategory(categoryId)
  return category?.subcategories.find((sub) => sub.id === subcategoryId) ?? null
}
