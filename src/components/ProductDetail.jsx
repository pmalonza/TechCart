import { formatCurrency } from '../utils/currency'
import { getCategory, getSubcategory } from '../data/categories'
import ProductImage from './ProductImage'

export default function ProductDetail({ product, onBack }) {
  const category = getCategory(product.category)
  const subcategory = getSubcategory(product.category, product.subcategory)

  return (
    <section className="product-detail" aria-label={`${product.name} details`}>
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back to products
      </button>
      <div className="product-detail-body">
        <div className="product-detail-image">
          <ProductImage subcategory={product.subcategory} />
        </div>
        <div className="product-detail-info">
          <p className="product-detail-breadcrumb">
            {category?.label}
            {subcategory && <> &rsaquo; {subcategory.label}</>}
          </p>
          <h2>{product.name}</h2>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-detail-price">{formatCurrency(product.price)}</p>
        </div>
      </div>
    </section>
  )
}
