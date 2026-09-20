import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { focusFirstError } from '../../components/forms/focusFirstError'
import PasswordField from '../../components/forms/PasswordField'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { safeRedirectPath, validateEmail } from '../../lib/auth'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const formRef = useRef<HTMLFormElement>(null)
  useDocumentTitle('Sign in')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const destination = safeRedirectPath((location.state as { from?: unknown } | null)?.from)
  if (user) return <Navigate to={destination} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    const next = { email: validateEmail(email) ?? undefined, password: password ? undefined : 'Enter your password.' }
    setErrors(next)
    if (next.email || next.password) {
      focusFirstError(formRef.current)
      return
    }
    setSubmitting(true)
    const result = await signIn({ email, password })
    setSubmitting(false)
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    navigate(destination, { replace: true })
  }

  return (
    <div className="container page">
      <div className="auth-card card card-pad">
        <h1>Sign in</h1>
        <p className="muted">Welcome back. Sign in to manage your account and orders.</p>

        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="forgot-link">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New to TechCart? <Link to="/register" state={location.state}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
