import { useState } from 'react'
import { subscribeToNewsletter } from '../data/newsletter'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const trimmed = email.trim()
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Enter a valid email address.')
      setStatus('')
      return
    }

    const result = subscribeToNewsletter(trimmed)
    if (!result.ok) {
      setError(result.message)
      setStatus('')
      return
    }

    setError('')
    setStatus(`Subscribed! We'll send updates to ${trimmed}.`)
    setEmail('')
  }

  return (
    <section className="newsletter" aria-label="Newsletter signup">
      <h2>Stay in the loop</h2>
      <p>Get updates on new products and deals.</p>
      <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="newsletter-email">Newsletter email</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <button type="submit" className="add-button">
          Subscribe
        </button>
      </form>
      {status && (
        <p role="status" className="auth-success">
          {status}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
