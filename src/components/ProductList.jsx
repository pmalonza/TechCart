import ProductCard from './ProductCard'

export default function ProductList({ products, onSelect }) {
  if (products.length === 0) {
    return <p className="empty-state">No products match this category yet.</p>
  }

  return (
    <ul className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelect} />
      ))}
    </ul>
  )
}
