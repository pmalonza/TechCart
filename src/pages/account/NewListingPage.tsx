import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { focusFirstError } from '../../components/forms/focusFirstError'
import SelectField from '../../components/forms/SelectField'
import TextField from '../../components/forms/TextField'
import ImageUploader from '../../components/ImageUploader'
import { useAnnounce } from '../../context/AnnouncerContext'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { IMAGE_LIMIT_HINT } from '../../lib/image'
import {
  LISTING_CATEGORY_OPTIONS,
  MAX_LISTINGS_PER_USER,
  canAddListing,
  emptyListingInput,
  listingsBySeller,
  validateListing,
  type ListingErrors,
  type ListingInput,
} from '../../lib/listings'

export default function NewListingPage() {
  const { user } = useAuth()
  const { products, addListing } = useProducts()
  const navigate = useNavigate()
  const announce = useAnnounce()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<ListingInput>(emptyListingInput())
  const [errors, setErrors] = useState<ListingErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  useDocumentTitle('Add a product')

  const mine = user ? listingsBySeller(products, user.id) : []
  const atLimit = user ? !canAddListing(products, user.id) : true

  function set<K extends keyof ListingInput>(field: K, value: ListingInput[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setFormError(null)
    const found = validateListing(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setFormError('Please fix the highlighted fields and try again.')
      focusFirstError(formRef.current)
      return
    }
    const result = addListing(user.id, values)
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    announce(`${result.product.name} is now listed`)
    navigate('/account/listings')
  }

  if (atLimit) {
    return (
      <section aria-labelledby="new-listing-heading" className="card card-pad stack">
        <h2 id="new-listing-heading">Add a product</h2>
        <p className="alert" role="status">
          You have {mine.length} of {MAX_LISTINGS_PER_USER} listings, the maximum. Remove one to add another.
        </p>
        <Link className="btn" to="/account/listings">
          Back to my listings
        </Link>
      </section>
    )
  }

  return (
    <section aria-labelledby="new-listing-heading" className="card card-pad">
      <h2 id="new-listing-heading">Add a product</h2>
      <p className="alert demo-notice" role="note">
        <strong>Demo marketplace.</strong> Listings and photos are saved in this browser only, so nobody else can see them and clearing your browser data
        removes them.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="listing-form" aria-label="Add a product">
        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <ImageUploader
          label="Product photo (optional)"
          value={values.image}
          onChange={(image) => set('image', image)}
          hint={`${IMAGE_LIMIT_HINT} Without one, we show a generated picture for the category.`}
        />

        <TextField label="Product name" name="name" value={values.name} error={errors.name} maxLength={80} onChange={(e) => set('name', e.target.value)} />
        <div className="form-grid">
          <TextField label="Brand" name="brand" value={values.brand} error={errors.brand} maxLength={40} onChange={(e) => set('brand', e.target.value)} />
          <SelectField
            label="Category"
            name="category"
            options={LISTING_CATEGORY_OPTIONS}
            value={values.category}
            error={errors.category}
            onChange={(e) => set('category', e.target.value)}
          />
        </div>
        <div className="form-grid">
          <TextField
            label="Price (USD)"
            name="price"
            inputMode="decimal"
            placeholder="49.99"
            value={values.price}
            error={errors.price}
            onChange={(e) => set('price', e.target.value)}
          />
          <TextField
            label="Original price (optional)"
            name="comparePrice"
            inputMode="decimal"
            placeholder="59.99"
            hint="Fill this in to show the product as on sale."
            value={values.comparePrice}
            error={errors.comparePrice}
            onChange={(e) => set('comparePrice', e.target.value)}
          />
        </div>
        <TextField
          label="Quantity in stock"
          name="stock"
          inputMode="numeric"
          value={values.stock}
          error={errors.stock}
          onChange={(e) => set('stock', e.target.value)}
        />

        <div className="field">
          <label htmlFor="listing-description">Description</label>
          <textarea
            id="listing-description"
            name="description"
            rows={5}
            maxLength={1000}
            value={values.description}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'listing-description-error' : undefined}
            onChange={(e) => set('description', e.target.value)}
          />
          {errors.description && (
            <span id="listing-description-error" className="error">
              {errors.description}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="listing-specs">Key features (optional)</label>
          <textarea
            id="listing-specs"
            name="specs"
            rows={4}
            value={values.specs}
            aria-invalid={errors.specs ? true : undefined}
            aria-describedby={`listing-specs-hint${errors.specs ? ' listing-specs-error' : ''}`}
            onChange={(e) => set('specs', e.target.value)}
          />
          <span id="listing-specs-hint" className="hint">
            One per line, up to 8.
          </span>
          {errors.specs && (
            <span id="listing-specs-error" className="error">
              {errors.specs}
            </span>
          )}
        </div>

        <TextField
          label="Search keywords (optional)"
          name="keywords"
          hint="Separated by commas, so shoppers can find it, e.g. wireless, travel."
          value={values.keywords}
          error={errors.keywords}
          onChange={(e) => set('keywords', e.target.value)}
        />

        <div className="button-row">
          <button type="submit" className="btn btn-primary">
            Publish product
          </button>
          <Link className="btn" to="/account/listings">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}
