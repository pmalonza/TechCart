import { useState } from 'react'
import { formatCurrency } from '../utils/currency'
import { getCategory, getSubcategory } from '../data/categories'
import ProductImage from './ProductImage'

export default function ProductDetail({ product, onBack, onAddToCart }) {
  const category = getCategory(product.category)
  const subcategory = getSubcategory(product.category, product.subcategory)
  const [selectedColor, setSelectedColor] = useState(product.colors[0].id)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? null)
  const [quantity, setQuantity] = useState('1')
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    const parsedQuantity = Math.max(1, Number(quantity) || 1)
    onAddToCart({ colorId: selectedColor, size: selectedSize, quantity: parsedQuantity })
    setQuantity(String(parsedQuantity))
    setAdded(true)
  }

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

          {product.colors.length > 1 && (
            <fieldset className="variant-group">
              <legend>Color: {product.colors.find((c) => c.id === selectedColor)?.label}</legend>
              <div className="color-swatches">
                {product.colors.map((color) => (
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
                    onClick={() => {
                      setSelectedColor(color.id)
                      setAdded(false)
                    }}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {product.sizes && (
            <fieldset className="variant-group">
              <legend>Size</legend>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={selectedSize === size ? 'size-chip size-chip-active' : 'size-chip'}
                    aria-pressed={selectedSize === size}
                    onClick={() => {
                      setSelectedSize(size)
                      setAdded(false)
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="add-to-cart-row">
            <label htmlFor="product-quantity">Qty</label>
            <input
              id="product-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                setAdded(false)
              }}
            />
            <button type="button" className="add-button" onClick={handleAddToCart}>
              Add to cart
            </button>
          </div>
          {added && (
            <p role="status" className="add-to-cart-confirmation">
              Added to cart.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
