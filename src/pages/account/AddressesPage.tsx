import { useState } from 'react'
import AddressForm from '../../components/AddressForm'
import AddressLines from '../../components/AddressLines'
import { useAnnounce } from '../../context/AnnouncerContext'
import { useAuth } from '../../context/AuthContext'
import { MAX_ADDRESSES, type AddressInput } from '../../lib/addresses'

type Mode = { kind: 'list' } | { kind: 'new' } | { kind: 'edit'; id: string }

export default function AddressesPage() {
  const { addresses, saveAddress, removeAddress, setDefaultAddress } = useAuth()
  const announce = useAnnounce()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const atLimit = addresses.length >= MAX_ADDRESSES

  function save(input: AddressInput, id?: string) {
    const result = saveAddress(input, id)
    if (!result.ok) return result.error
    announce(id ? 'Address updated' : 'Address added')
    setMode({ kind: 'list' })
    return null
  }

  const editing = mode.kind === 'edit' ? addresses.find((address) => address.id === mode.id) : undefined

  return (
    <section aria-labelledby="addresses-heading" className="stack">
      <div className="card card-pad">
        <div className="section-head">
          <h2 id="addresses-heading">Saved addresses</h2>
          {mode.kind === 'list' && (
            <button type="button" className="btn btn-primary btn-sm" disabled={atLimit} onClick={() => setMode({ kind: 'new' })}>
              Add a new address
            </button>
          )}
        </div>
        <p className="muted">Save the places you get deliveries so checkout is quick. You can save up to {MAX_ADDRESSES}.</p>
        {atLimit && mode.kind === 'list' && (
          <p className="alert" role="status">
            You have saved {MAX_ADDRESSES} addresses, the maximum. Remove one to add another.
          </p>
        )}

        {mode.kind === 'new' && (
          <div className="address-editor">
            <h3>New address</h3>
            <AddressForm
              idPrefix="new-address"
              submitLabel="Save address"
              showDefaultOption={addresses.length > 0}
              onSubmit={(input) => save(input)}
              onCancel={() => setMode({ kind: 'list' })}
            />
          </div>
        )}
      </div>

      {addresses.length === 0 && mode.kind !== 'new' ? (
        <div className="card card-pad empty-state">
          <h3>No saved addresses yet</h3>
          <p>Add an address to speed up checkout.</p>
        </div>
      ) : (
        <ul className="address-list" aria-label="Your addresses">
          {addresses.map((address) => (
            <li key={address.id} className="card card-pad address-card">
              {editing?.id === address.id ? (
                <div className="address-editor">
                  <h3>Edit address</h3>
                  <AddressForm
                    idPrefix={`edit-${address.id}`}
                    initial={{ ...address }}
                    submitLabel="Save changes"
                    showDefaultOption
                    defaultLocked={address.isDefault}
                    onSubmit={(input) => save(input, address.id)}
                    onCancel={() => setMode({ kind: 'list' })}
                  />
                </div>
              ) : (
                <>
                  <div className="address-card-head">
                    <h3>{address.label || 'Address'}</h3>
                    {address.isDefault && <span className="badge-pill">Default</span>}
                  </div>
                  <AddressLines address={address} />
                  <div className="address-actions">
                    <button
                      type="button"
                      className="btn btn-sm"
                      aria-label={`Edit ${address.label || address.line1}`}
                      onClick={() => setMode({ kind: 'edit', id: address.id })}
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        aria-label={`Set ${address.label || address.line1} as default`}
                        onClick={() => {
                          setDefaultAddress(address.id)
                          announce(`${address.label || 'Address'} is now your default address`)
                        }}
                      >
                        Set as default
                      </button>
                    )}
                    {confirmingId === address.id ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          aria-label={`Confirm delete ${address.label || address.line1}`}
                          onClick={() => {
                            removeAddress(address.id)
                            setConfirmingId(null)
                            announce('Address removed')
                          }}
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          aria-label={`Keep ${address.label || address.line1}`}
                          onClick={() => setConfirmingId(null)}
                        >
                          Keep
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        aria-label={`Delete ${address.label || address.line1}`}
                        onClick={() => setConfirmingId(address.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
