import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { focusFirstError } from '../../components/forms/focusFirstError'
import PasswordField from '../../components/forms/PasswordField'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PASSWORD_MIN_LENGTH, validatePassword } from '../../lib/auth'

type LinkState = 'checking' | 'valid' | 'invalid' | 'done'

export default function ResetPasswordPage() {
  const { checkResetToken, resetPassword } = useAuth()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const formRef = useRef<HTMLFormElement>(null)
  useDocumentTitle('Choose a new password')

  const [state, setState] = useState<LinkState>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    void checkResetToken(token).then((valid) => {
      if (!cancelled) setState((current) => (current === 'done' ? current : valid ? 'valid' : 'invalid'))
    })
    return () => {
      cancelled = true
    }
  }, [token, checkResetToken])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    const found = {
      password: validatePassword(password) ?? undefined,
      confirm: confirm !== password ? 'The passwords do not match.' : undefined,
    }
    setErrors(found)
    if (found.password || found.confirm) {
      focusFirstError(formRef.current)
      return
    }
    setSubmitting(true)
    const result = await resetPassword({ token, newPassword: password })
    setSubmitting(false)
    if (result.ok) setState('done')
    else setFormError(result.error)
  }

  return (
    <div className="container page">
      <div className="auth-card card card-pad">
        {state === 'checking' && (
          <p className="muted" role="status">
            Checking your reset link...
          </p>
        )}

        {state === 'invalid' && (
          <>
            <h1>This link has expired</h1>
            <p className="muted">
              Reset links work once and for 30 minutes. Request a new one and we will send you a fresh link.
            </p>
            <Link className="btn btn-primary btn-block" to="/forgot-password">
              Request a new link
            </Link>
          </>
        )}

        {state === 'done' && (
          <>
            <h1>Password updated</h1>
            <div className="alert alert-success" role="status">
              Your password has been changed. You can sign in with it now.
            </div>
            <Link className="btn btn-primary btn-block" to="/login">
              Go to sign in
            </Link>
          </>
        )}

        {state === 'valid' && (
          <>
            <h1>Choose a new password</h1>
            {formError && (
              <div className="alert alert-error" role="alert">
                {formError}
              </div>
            )}
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <PasswordField
                label="New password"
                name="password"
                autoComplete="new-password"
                hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
                value={password}
                error={errors.password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <PasswordField
                label="Confirm new password"
                name="confirm"
                autoComplete="new-password"
                value={confirm}
                error={errors.confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Saving...' : 'Set new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
