import { COUNTRIES, getCountry, type AddressErrors, type AddressInput } from '../lib/addresses'
import SelectField from './forms/SelectField'
import TextField from './forms/TextField'

interface AddressFieldsProps {
  /** Unique per set of fields on the page, so field ids never collide. */
  idPrefix: string
  values: AddressInput
  errors: AddressErrors
  onChange: <K extends keyof AddressInput>(field: K, value: AddressInput[K]) => void
  /** Show the optional nickname field (saved addresses have one; a one-off delivery address does not need it). */
  showLabel?: boolean
}

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({ value: country.code, label: country.name }))

/** The controlled input fields for an address. It renders no <form>, so it can sit inside any form. */
export default function AddressFields({ idPrefix, values, errors, onChange, showLabel = true }: AddressFieldsProps) {
  const country = getCountry(values.country)
  const id = (field: string) => `${idPrefix}-${field}`

  return (
    <div className="form-grid">
      <TextField
        id={id('fullName')}
        label="Full name"
        name="name"
        autoComplete="name"
        value={values.fullName}
        error={errors.fullName}
        onChange={(event) => onChange('fullName', event.target.value)}
      />
      <TextField
        id={id('phone')}
        label="Phone number"
        type="tel"
        name="tel"
        autoComplete="tel"
        value={values.phone}
        error={errors.phone}
        onChange={(event) => onChange('phone', event.target.value)}
      />
      <SelectField
        id={id('country')}
        label="Country"
        name="country"
        autoComplete="country"
        options={COUNTRY_OPTIONS}
        value={values.country}
        error={errors.country}
        onChange={(event) => onChange('country', event.target.value)}
      />
      <TextField
        id={id('line1')}
        label="Street address"
        name="address-line1"
        autoComplete="address-line1"
        value={values.line1}
        error={errors.line1}
        onChange={(event) => onChange('line1', event.target.value)}
      />
      <TextField
        id={id('line2')}
        label="Apartment, suite, building (optional)"
        name="address-line2"
        autoComplete="address-line2"
        value={values.line2}
        error={errors.line2}
        onChange={(event) => onChange('line2', event.target.value)}
      />
      <TextField
        id={id('city')}
        label="City or town"
        name="address-level2"
        autoComplete="address-level2"
        value={values.city}
        error={errors.city}
        onChange={(event) => onChange('city', event.target.value)}
      />
      <TextField
        id={id('region')}
        label={country?.regionRequired ? 'State, province or region' : 'State, province or region (optional)'}
        name="address-level1"
        autoComplete="address-level1"
        value={values.region}
        error={errors.region}
        onChange={(event) => onChange('region', event.target.value)}
      />
      <TextField
        id={id('postalCode')}
        label="Postal code"
        name="postal-code"
        autoComplete="postal-code"
        hint={country ? `For example ${country.postalExample}` : undefined}
        value={values.postalCode}
        error={errors.postalCode}
        onChange={(event) => onChange('postalCode', event.target.value)}
      />
      {showLabel && (
        <TextField
          id={id('label')}
          label="Label (optional)"
          name="address-label"
          hint="For example Home or Office"
          value={values.label}
          error={errors.label}
          onChange={(event) => onChange('label', event.target.value)}
        />
      )}
    </div>
  )
}
