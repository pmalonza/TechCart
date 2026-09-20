import { useRef, useState, type FormEvent } from 'react'
import { focusFirstError } from '../../components/forms/focusFirstError'
import PasswordField from '../../components/forms/PasswordField'
import { useAnnounce } from '../../context/AnnouncerContext'
import { useAuth } from '../../context/AuthContext'
import { PASSWORD_MIN_LENGTH, validatePassword } from '../../lib/auth'

type Message = { kind: 'success' | 'error'; text: string } | null

function ChangePasswordForm() {
  const { changePassword } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})
  const [message, setMessage] = useState<Message>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    const found = {
      current: current ? undefined : 'Enter your current password.',
      next: validatePassword(next) ?? undefined,
      confirm: confirm !== next ? 'The passwords do not match.' : undefined,
    }
    setErrors(found)
    if (found.current || found.next || found.confirm) {
      focusFirstError(formRef.current)
      return
    }
    setSubmitting(true)
    const result = await changePassword({ currentPassword: current, newPassword: next })
    setSubmitting(false)
    if (result.ok) {
      setCurrent('')
      setNext('')
      setConfirm('')
      setMessage({ kind: 'success', text: 'Your password has been changed.' })
    } else {
      setMessage({ kind: 'error', text: result.error })
    }
  }

  return (
    <section aria-labelledby="password-heading" className="card card-pad">
      <h2 id="password-heading">Change password</h2>

      {message && (
        <div className={message.kind === 'success' ? 'alert alert-success' : 'alert alert-error'} role={message.kind === 'success' ? 'status' : 'alert'}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="form-narrow">
        <PasswordField
          label="Current password"
          name="current"
          autoComplete="current-password"
          value={current}
          error={errors.current}
          onChange={(event) => setCurrent(event.target.value)}
        />
        <PasswordField
          label="New password"
          name="new"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
          value={next}
          error={errors.next}
          onChange={(event) => setNext(event.target.value)}
        />
        <PasswordField
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          value={confirm}
          error={errors.confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </section>
  )
}

function DeleteAccountSection() {
  const { deleteAccount } = useAuth()
  const announce = useAnnounce()
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleDelete(event: FormEvent) {
    event.preventDefault()
    if (!password) {
      setError('Enter your password to confirm.')
      return
    }
    setSubmitting(true)
    const result = await deleteAccount(password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    announce('Your account has been deleted')
  }

  return (
    <section aria-labelledby="delete-heading" className="card card-pad danger-zone">
      <h2 id="delete-heading">Delete account</h2>
      <p className="muted">
        This permanently removes your account. Items in your cart and wishlist stay on this device, but your profile and password are erased.
      </p>

      {!confirming ? (
        <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
          Delete my account
        </button>
      ) : (
        <form onSubmit={handleDelete} noValidate className="form-narrow">
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <PasswordField
            label="Confirm with your password"
            name="delete-password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
          />
          <div className="button-row">
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Deleting...' : 'Permanently delete account'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setConfirming(false)
                setPassword('')
                setError(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default function SecurityPage() {
  return (
    <div className="stack">
      <ChangePasswordForm />
      <DeleteAccountSection />
    </div>
  )
}
