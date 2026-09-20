import { useId, type SelectHTMLAttributes } from 'react'

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  options: { value: string; label: string }[]
  error?: string
  hint?: string
  id?: string
}

/** A labelled select with an optional hint and error, wired up with aria-invalid and aria-describedby. */
export default function SelectField({ label, options, error, hint, id, ...selectProps }: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const describedBy = [hint ? `${selectId}-hint` : null, error ? `${selectId}-error` : null].filter(Boolean).join(' ')

  return (
    <div className="field">
      <label htmlFor={selectId}>{label}</label>
      <select {...selectProps} id={selectId} aria-invalid={error ? true : undefined} aria-describedby={describedBy || undefined}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <span id={`${selectId}-hint`} className="hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${selectId}-error`} className="error">
          {error}
        </span>
      )}
    </div>
  )
}
