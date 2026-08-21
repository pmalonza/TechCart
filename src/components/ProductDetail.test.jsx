import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetail from './ProductDetail'
import { getProduct } from '../data/products'
import { getProductImage } from '../data/productImages'

describe('ProductDetail', () => {
  const product = getProduct('ref-1')

  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the product name, description, price, and breadcrumb', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument()
    expect(screen.getByText(product.description)).toBeInTheDocument()
    expect(screen.getByText('$649.99')).toBeInTheDocument()
    expect(screen.getByText('Electronics › Refrigerators')).toBeInTheDocument()
  })

  it('shows Add to wishlist when not wishlisted and calls onToggleWishlist', async () => {
    const user = userEvent.setup()
    const onToggleWishlist = vi.fn()
    render(
      <ProductDetail
        product={product}
        onBack={vi.fn()}
        onAddToCart={vi.fn()}
        inWishlist={false}
        onToggleWishlist={onToggleWishlist}
      />,
    )

    const button = screen.getByRole('button', { name: /Add to wishlist/ })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)

    expect(onToggleWishlist).toHaveBeenCalledTimes(1)
  })

  it('shows In wishlist when already wishlisted', () => {
    render(
      <ProductDetail
        product={product}
        onBack={vi.fn()}
        onAddToCart={vi.fn()}
        inWishlist
        onToggleWishlist={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: /In wishlist/ })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not show a strikethrough price for a product with no sale', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)
    expect(screen.queryByText('$649.99', { selector: '.product-detail-original-price' })).not.toBeInTheDocument()
  })

  it('shows the original price struck through for an on-sale product', () => {
    const onSaleProduct = getProduct('tv-2')
    render(<ProductDetail product={onSaleProduct} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    expect(screen.getByText('$1,299.00')).toBeInTheDocument()
    expect(screen.getByText('$999.00')).toBeInTheDocument()
  })

  it('shows the product specs', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    for (const spec of product.specs) {
      expect(screen.getByText(spec.label)).toBeInTheDocument()
      expect(screen.getByText(spec.value)).toBeInTheDocument()
    }
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<ProductDetail product={product} onBack={onBack} onAddToCart={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /Back to products/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('defaults to the first color and updates the label on selection', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    expect(screen.getByText('Color: White')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Black' }))

    expect(screen.getByText('Color: Black')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Black' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'White' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not show a color group for a product with only one color', () => {
    const singleColorProduct = getProduct('tv-1')
    render(<ProductDetail product={singleColorProduct} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    expect(screen.queryByText(/^Color:/)).not.toBeInTheDocument()
  })

  it('shows size options for a product that has them, defaulting to the first', async () => {
    const user = userEvent.setup()
    const monitor = getProduct('cacc-3')
    render(<ProductDetail product={monitor} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    expect(screen.getByRole('button', { name: '24"' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: '32"' }))

    expect(screen.getByRole('button', { name: '32"' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '24"' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not show a size group for a product with no sizes', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)
    expect(screen.queryByText('Size')).not.toBeInTheDocument()
  })

  it('adds the default variant and quantity to the cart', async () => {
    const user = userEvent.setup()
    const onAddToCart = vi.fn()
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={onAddToCart} />)

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(onAddToCart).toHaveBeenCalledWith({ colorId: 'white', size: null, quantity: 1 })
  })

  it('adds the selected color, size, and quantity to the cart', async () => {
    const user = userEvent.setup()
    const onAddToCart = vi.fn()
    const phone = getProduct('phone-1')
    render(<ProductDetail product={phone} onBack={vi.fn()} onAddToCart={onAddToCart} />)

    await user.click(screen.getByRole('button', { name: 'Ocean Blue' }))
    await user.click(screen.getByRole('button', { name: '256GB' }))
    const qtyInput = screen.getByLabelText('Qty')
    await user.clear(qtyInput)
    await user.type(qtyInput, '3')
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(onAddToCart).toHaveBeenCalledWith({ colorId: 'blue', size: '256GB', quantity: 3 })
  })

  it('shows a confirmation message after adding to cart', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(screen.getByRole('status')).toHaveTextContent('Added to cart.')
  })

  it('shows an "Add a photo" prompt with no uploaded image', () => {
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)
    expect(screen.getByText('Add a photo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove photo' })).not.toBeInTheDocument()
  })

  it('uploads a photo, shows it, and persists it', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    const file = new File(['fake-image-bytes'], 'fridge.png', { type: 'image/png' })
    const input = document.getElementById('product-image-upload')
    await user.upload(input, file)

    await waitFor(() => {
      expect(document.querySelector('.product-image-photo')).toBeInTheDocument()
    })
    expect(screen.getByText('Change photo')).toBeInTheDocument()
    expect(getProductImage(product.id)).toMatch(/^data:/)
  })

  it('removes an uploaded photo', async () => {
    const user = userEvent.setup()
    render(<ProductDetail product={product} onBack={vi.fn()} onAddToCart={vi.fn()} />)

    const file = new File(['fake-image-bytes'], 'fridge.png', { type: 'image/png' })
    const input = document.getElementById('product-image-upload')
    await user.upload(input, file)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove photo' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Remove photo' }))

    expect(screen.getByText('Add a photo')).toBeInTheDocument()
    expect(getProductImage(product.id)).toBeNull()
  })
})
