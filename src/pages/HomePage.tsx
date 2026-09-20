import { Link } from 'react-router-dom'
import CategoryTiles from '../components/CategoryTiles'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'

export default function HomePage() {
  const { products } = useProducts()
  const topRated = [...products].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 4)

  return (
    <div className="container page">
      <section className="hero">
        <h1>Gadgets you will actually use.</h1>
        <p>Laptops, phones, audio, wearables and gaming gear - a demo storefront built with React and TypeScript.</p>
        <Link className="btn btn-hero" to="/products">
          Shop all products
        </Link>
      </section>

      <section aria-labelledby="categories-heading" className="section">
        <div className="section-head">
          <h2 id="categories-heading">Shop by category</h2>
        </div>
        <CategoryTiles />
      </section>

      <section aria-labelledby="top-rated-heading" className="section">
        <div className="section-head">
          <h2 id="top-rated-heading">Top rated</h2>
          <Link to="/products">See everything</Link>
        </div>
        <ProductGrid products={topRated} label="Top rated products" />
      </section>
    </div>
  )
}
