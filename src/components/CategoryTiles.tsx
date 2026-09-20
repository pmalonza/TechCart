import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useProducts } from '../context/ProductsContext'

export default function CategoryTiles() {
  const { products } = useProducts()
  return (
    <ul className="category-tiles">
      {CATEGORIES.map((category) => {
        const count = products.filter((product) => product.category === category.id).length
        return (
          <li key={category.id}>
            <Link
              className="category-tile"
              to={`/products?category=${category.id}`}
              style={{ '--tile-hue': category.hue } as React.CSSProperties}
            >
              <span className="category-tile-name">{category.name}</span>
              <span className="category-tile-blurb">{category.blurb}</span>
              <span className="category-tile-count">
                {count} {count === 1 ? 'product' : 'products'}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
