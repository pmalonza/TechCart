import { useRef, useState, type FormEvent } from 'react'
import { COUNTRIES, emptyAddressInput, getCountry, normalizeAddress, validateAddress, type AddressErrors, type AddressInput } from '../lib/addresses'
import { focusFirstError } from './forms/focusFirstError'
import SelectField from './forms/SelectField'
import TextField from './forms/TextField'

interface AddressFormProps {
  /** Unique per form on the page, so field ids never collide. */
  idPrefix: string
  initial?: AddressInput
  submitLabel: string
  /** Show the "use as my default address" checkbox (for saved addresses; not for one-off guest addresses). */
  showDefaultOption?: boolean
  /** The address being edited is already the default, so it cannot be un-defaulted here. */
  defaultLocked?: boolean
  /** Return a message to show as a form-level error, or nothing on success. */
  onSubmit: (address: AddressInput) => string | null | void
  onCancel?: () => void
}

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({ value: country.code, label: country.name }))

/** Collects and validates a delivery address. */
export default function AddressForm({ idPrefix, initial, submitLabel, showDefaultOption = false, defaultLocked = false, onSubmit, onCancel }: AddressFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<AddressInput>(initial ?? emptyAddressInput())
  const [errors, setErrors] = useState<AddressErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const country = getCountry(values.country)
  const id = (field: string) => `${idPrefix}-${field}`
  const set = <K extends keyof AddressInput>(field: K, value: AddressInput[K]) => setValues((current) => ({ ...current, [field]: value }))

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

      <div className="form-grid">
        <TextField
          id={id('fullName')}
          label="Full name"
          name="name"
          autoComplete="name"
          value={values.fullName}
          error={errors.fullName}
          onChange={(event) => set('fullName', event.target.value)}
        />
        <TextField
          id={id('phone')}
          label="Phone number"
          type="tel"
          name="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => set('phone', event.target.value)}
        />
        <SelectField
          id={id('country')}
          label="Country"
          name="country"
          autoComplete="country"
          options={COUNTRY_OPTIONS}
          value={values.country}
          error={errors.country}
          onChange={(event) => set('country', event.target.value)}
        />
        <TextField
          id={id('line1')}
          label="Street address"
          name="address-line1"
          autoComplete="address-line1"
          value={values.line1}
          error={errors.line1}
          onChange={(event) => set('line1', event.target.value)}
        />
        <TextField
          id={id('line2')}
          label="Apartment, suite, building (optional)"
          name="address-line2"
          autoComplete="address-line2"
          value={values.line2}
          error={errors.line2}
          onChange={(event) => set('line2', event.target.value)}
        />
        <TextField
          id={id('city')}
          label="City or town"
          name="address-level2"
          autoComplete="address-level2"
          value={values.city}
          error={errors.city}
          onChange={(event) => set('city', event.target.value)}
        />
        <TextField
          id={id('region')}
          label={country?.regionRequired ? 'State, province or region' : 'State, province or region (optional)'}
          name="address-level1"
          autoComplete="address-level1"
          value={values.region}
          error={errors.region}
          onChange={(event) => set('region', event.target.value)}
        />
        <TextField
          id={id('postalCode')}
          label="Postal code"
          name="postal-code"
          autoComplete="postal-code"
          hint={country ? `For example ${country.postalExample}` : undefined}
          value={values.postalCode}
          error={errors.postalCode}
          onChange={(event) => set('postalCode', event.target.value)}
        />
        <TextField
          id={id('label')}
          label="Label (optional)"
          name="address-label"
          hint="For example Home or Office"
          value={values.label}
          error={errors.label}
          onChange={(event) => set('label', event.target.value)}
        />
      </div>

      {showDefaultOption && (
        <label className="check default-check">
          <input
            type="checkbox"
            checked={defaultLocked || values.isDefault}
            disabled={defaultLocked}
            onChange={(event) => set('isDefault', event.target.checked)}
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
