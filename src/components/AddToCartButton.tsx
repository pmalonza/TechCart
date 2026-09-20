import { useEffect, useRef, useState } from 'react'
import { useAnnounce } from '../context/AnnouncerContext'
import { useCart } from '../context/CartContext'
import { maxQuantity } from '../lib/cart'
import type { Product } from '../types'
import { CartIcon } from './icons'

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className?: string
}

/** Adds a product to the cart, with brief "Added" feedback (also announced to screen readers) and sensible disabled states. */
export default function AddToCartButton({ product, quantity = 1, className = '' }: AddToCartButtonProps) {
  const { add, getQuantity } = useCart()
  const announce = useAnnounce()
  const [justAdded, setJustAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const max = maxQuantity(product)
  const inCart = getQuantity(product.id)
  const classes = `btn btn-primary ${className}`.trim()

  if (max <= 0) {
    return (
      <button type="button" className={classes} disabled>
        Out of stock
      </button>
    )
  }

  if (inCart >= max) {
    return (
      <button type="button" className={classes} disabled>
        Maximum in cart
      </button>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={() => {
        add(product, quantity)
        announce(`${quantity > 1 ? `${quantity} x ` : ''}${product.name} added to cart`)
        setJustAdded(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setJustAdded(false), 1600)
      }}
    >
      <CartIcon className="btn-icon" />
      {justAdded ? 'Added to cart' : 'Add to cart'}
    </button>
  )
}
