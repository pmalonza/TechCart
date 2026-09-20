import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import DemoInbox from '../../components/DemoInbox'
import { focusFirstError } from '../../components/forms/focusFirstError'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { validateEmail } from '../../lib/auth'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  useDocumentTitle('Reset your password')

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState<{ email: string; token: string | null } | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const problem = validateEmail(email)
    setError(problem ?? undefined)
    if (problem) {
      focusFirstError(formRef.current)
      return
    }
    setSubmitting(true)
    const { token } = await requestPasswordReset(email)
    setSubmitting(false)
    setSent({ email: email.trim(), token })
  }

  return (
    <div className="container page">
      <div className="auth-card card card-pad">
        <h1>Reset your password</h1>

        {sent ? (
          <>
            <div className="alert alert-success" role="status">
              If an account exists for <strong>{sent.email}</strong>, we have sent a link to reset its password. It works for 30 minutes.
            </div>
            {sent.token && <DemoInbox to={sent.email} resetPath={`/reset-password?token=${sent.token}`} />}
            <p className="auth-switch">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="muted">Enter the email you signed up with and we will send you a link to choose a new password.</p>
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                error={error}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p className="auth-switch">
              Remembered it? <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
