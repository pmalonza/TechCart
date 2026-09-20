import { useId, useState } from 'react'
import TextField, { type TextFieldProps } from './TextField'

/** A password input with a show/hide toggle. */
export default function PasswordField(props: Omit<TextFieldProps, 'type'>) {
  const [visible, setVisible] = useState(false)
  const generatedId = useId()
  const id = props.id ?? generatedId

  return (
    <div className="password-field">
      <TextField {...props} id={id} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle btn-link"
        aria-pressed={visible}
        aria-controls={id}
        aria-label={`${visible ? 'Hide' : 'Show'} ${props.label.toLowerCase()}`}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
