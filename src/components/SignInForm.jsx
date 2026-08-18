import { useState } from 'react'

export default function SignInForm({ onSignIn }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    const result = await onSignIn({ email: form.email.trim(), password: form.password })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setForm({ email: '', password: '' })
    setError('')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="add-button" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
