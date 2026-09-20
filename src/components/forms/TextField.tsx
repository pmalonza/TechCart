import { useId, type InputHTMLAttributes } from 'react'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  id?: string
}

/** A labelled text input with an optional hint and error, wired up with aria-invalid and aria-describedby. */
export default function TextField({ label, error, hint, id, className, ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null].filter(Boolean).join(' ')

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        {...inputProps}
        id={inputId}
        className={className}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {hint && (
        <span id={`${inputId}-hint`} className="hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className="error">
          {error}
        </span>
      )}
    </div>
  )
}
