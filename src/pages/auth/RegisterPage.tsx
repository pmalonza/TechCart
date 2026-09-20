import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { focusFirstError } from '../../components/forms/focusFirstError'
import PasswordField from '../../components/forms/PasswordField'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PASSWORD_MIN_LENGTH, safeRedirectPath, validateEmail, validateName, validatePassword } from '../../lib/auth'

interface Errors {
  name?: string
  email?: string
  password?: string
  confirm?: string
}

export default function RegisterPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const formRef = useRef<HTMLFormElement>(null)
  useDocumentTitle('Create account')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const destination = safeRedirectPath((location.state as { from?: unknown } | null)?.from)
  if (user) return <Navigate to={destination} replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    const next: Errors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: confirm !== password ? 'The passwords do not match.' : undefined,
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      focusFirstError(formRef.current)
      return
    }
    setSubmitting(true)
    const result = await signUp({ name, email, password })
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
        <h1>Create your account</h1>
        <p className="muted">Save addresses, track orders and check out faster.</p>

        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full name"
            name="name"
            autoComplete="name"
            value={name}
            error={errors.name}
            onChange={(event) => setName(event.target.value)}
          />
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
            autoComplete="new-password"
            hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordField
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            error={errors.confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
