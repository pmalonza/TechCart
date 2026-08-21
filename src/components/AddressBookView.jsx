import { useState } from 'react'

export default function AddressBookView({ addresses, onBack, onAdd, onRemove, onSetDefault }) {
  const [form, setForm] = useState({ label: '', street: '', city: '', postalCode: '' })
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.street.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setError('Enter a complete address.')
      return
    }

    setError('')
    onAdd({
      label: form.label.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
    })
    setForm({ label: '', street: '', city: '', postalCode: '' })
  }

  return (
    <section className="address-book-view" aria-label="Address book">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Your addresses</h2>

      {addresses.length === 0 ? (
        <p>You haven&apos;t saved any addresses yet.</p>
      ) : (
        <ul className="address-list">
          {addresses.map((address) => (
            <li key={address.id} className="address-item">
              <div className="address-item-info">
                {address.label && <p className="address-item-label">{address.label}</p>}
                <p className="address-item-lines">
                  {address.street}, {address.city} {address.postalCode}
                </p>
              </div>
              {address.isDefault ? (
                <span className="address-item-default">Default</span>
              ) : (
                <button type="button" className="text-button" onClick={() => onSetDefault(address.id)}>
                  Set as default
                </button>
              )}
              <button
                type="button"
                className="text-button"
                onClick={() => onRemove(address.id)}
                aria-label={`Remove ${address.label || address.street}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="auth-form address-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="address-label">Label (optional)</label>
          <input id="address-label" name="label" type="text" value={form.label} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="address-street">Street address</label>
          <input id="address-street" name="street" type="text" value={form.street} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="address-city">City</label>
          <input id="address-city" name="city" type="text" value={form.city} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="address-postal-code">Postal code</label>
          <input
            id="address-postal-code"
            name="postalCode"
            type="text"
            value={form.postalCode}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="add-button">
          Add address
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
