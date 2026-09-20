import { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageUploader from '../../components/ImageUploader'
import ProductImage from '../../components/ProductImage'
import { useAnnounce } from '../../context/AnnouncerContext'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'
import { getCategory } from '../../data/categories'
import { IMAGE_LIMIT_HINT } from '../../lib/image'
import { MAX_LISTINGS_PER_USER, listingsBySeller } from '../../lib/listings'
import { formatPrice } from '../../lib/money'

export default function ListingsPage() {
  const { user } = useAuth()
  const { products, setListingImage, removeListing } = useProducts()
  const announce = useAnnounce()
  const [photoEditingId, setPhotoEditingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const mine = user ? listingsBySeller(products, user.id) : []
  const atLimit = mine.length >= MAX_LISTINGS_PER_USER

  function savePhoto(id: string, image: string | undefined) {
    if (!user) return
    const result = setListingImage(id, user.id, image)
    if (!result.ok) {
      setPhotoError(result.error)
      return
    }
    setPhotoError(null)
    if (image === undefined) setPhotoEditingId(null)
  }

  function remove(id: string, name: string) {
    if (!user) return
    removeListing(id, user.id)
    setConfirmingId(null)
    if (photoEditingId === id) setPhotoEditingId(null)
    announce(`${name} was removed`)
  }

  return (
    <section aria-labelledby="listings-heading" className="stack">
      <div className="card card-pad">
        <div className="section-head">
          <h2 id="listings-heading">My listings</h2>
          {atLimit ? (
            <button type="button" className="btn btn-primary btn-sm" disabled>
              Add a product
            </button>
          ) : (
            <Link className="btn btn-primary btn-sm" to="/account/listings/new">
              Add a product
            </Link>
          )}
        </div>
        <p className="muted">
          Products you list appear in the shop with your photo. You can list up to {MAX_LISTINGS_PER_USER}. This is a demo: listings are kept in this browser
          only.
        </p>
        {atLimit && (
          <p className="alert" role="status">
            You have listed {MAX_LISTINGS_PER_USER} products, the maximum. Remove one to add another.
          </p>
        )}
      </div>

      {mine.length === 0 ? (
        <div className="card card-pad empty-state">
          <h3>No listings yet</h3>
          <p>Add a product with a photo and it will show up in the shop.</p>
          <Link className="btn btn-primary" to="/account/listings/new">
            Add your first product
          </Link>
        </div>
      ) : (
        <ul className="listing-list" aria-label="Your listings">
          {mine.map((product) => (
            <li key={product.id} className="card card-pad listing-row">
              <div className="listing-thumb">
                <ProductImage product={product} />
              </div>
              <div className="listing-info">
                <h3>
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                </h3>
                <p className="muted small">
                  {product.brand} &middot; {getCategory(product.category).name} &middot; {formatPrice(product.priceCents)} &middot;{' '}
                  {product.stock === 0 ? 'Sold out' : `${product.stock} in stock`}
                </p>
                <p className="muted small">{product.image ? 'Using your photo' : 'Using the generated picture'}</p>

                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-sm"
                    aria-expanded={photoEditingId === product.id}
                    aria-label={`${product.image ? 'Change photo' : 'Add a photo'} for ${product.name}`}
                    onClick={() => {
                      setPhotoError(null)
                      setPhotoEditingId(photoEditingId === product.id ? null : product.id)
                    }}
                  >
                    {product.image ? 'Change photo' : 'Add a photo'}
                  </button>
                  {confirmingId === product.id ? (
                    <>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(product.id, product.name)}>
                        Yes, delete {product.name}
                      </button>
                      <button type="button" className="btn btn-sm" onClick={() => setConfirmingId(null)}>
                        Keep it
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-sm btn-danger" aria-label={`Delete ${product.name}`} onClick={() => setConfirmingId(product.id)}>
                      Delete
                    </button>
                  )}
                </div>

                {photoEditingId === product.id && (
                  <div className="listing-photo-editor">
                    <ImageUploader
                      label={`Photo for ${product.name}`}
                      value={product.image}
                      onChange={(image) => savePhoto(product.id, image)}
                      error={photoError ?? undefined}
                      hint={IMAGE_LIMIT_HINT}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
