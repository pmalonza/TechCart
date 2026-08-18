import { useState } from 'react'
import { isAllowedEmailProvider } from '../utils/email'

export default function SignUpForm({ onSignUp }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const name = form.name.trim()
    if (!/\p{L}/u.test(name)) {
      setError('Enter your name.')
      return
    }
    if (!isAllowedEmailProvider(form.email.trim())) {
      setError('Enter a valid email from a supported provider (Gmail, Outlook, Yahoo, iCloud, etc.).')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const result = await onSignUp({ name, email: form.email.trim(), password: form.password })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    setError('')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="signup-name">Name</label>
        <input id="signup-name" name="name" type="text" value={form.name} onChange={handleChange} />
      </div>
      <div className="field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label htmlFor="signup-confirm-password">Confirm password</label>
        <input
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="add-button" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
