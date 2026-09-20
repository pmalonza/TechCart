import { useRef, useState, type FormEvent } from 'react'
import { emptyAddressInput, normalizeAddress, validateAddress, type AddressErrors, type AddressInput } from '../lib/addresses'
import AddressFields from './AddressFields'
import { focusFirstError } from './forms/focusFirstError'

interface AddressFormProps {
  /** Unique per form on the page, so field ids never collide. */
  idPrefix: string
  initial?: AddressInput
  submitLabel: string
  /** Show the "use as my default address" checkbox (for saved addresses). */
  showDefaultOption?: boolean
  /** The address being edited is already the default, so it cannot be un-defaulted here. */
  defaultLocked?: boolean
  /** Return a message to show as a form-level error, or nothing on success. */
  onSubmit: (address: AddressInput) => string | null | void
  onCancel?: () => void
}

/** A standalone form for adding or editing a saved address. */
export default function AddressForm({ idPrefix, initial, submitLabel, showDefaultOption = false, defaultLocked = false, onSubmit, onCancel }: AddressFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<AddressInput>(initial ?? emptyAddressInput())
  const [errors, setErrors] = useState<AddressErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    const found = validateAddress(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      focusFirstError(formRef.current)
      return
    }
    const problem = onSubmit(normalizeAddress(values))
    if (problem) setFormError(problem)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="address-form" aria-label={submitLabel}>
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}

      <AddressFields
        idPrefix={idPrefix}
        values={values}
        errors={errors}
        onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
      />

      {showDefaultOption && (
        <label className="check default-check">
          <input
            type="checkbox"
            checked={defaultLocked || values.isDefault}
            disabled={defaultLocked}
            onChange={(event) => setValues((current) => ({ ...current, isDefault: event.target.checked }))}
          />
          <span>{defaultLocked ? 'This is your default address' : 'Use as my default address'}</span>
        </label>
      )}

      <div className="button-row">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
