import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAnnounce } from '../context/AnnouncerContext'
import { useNewsletter } from '../context/NewsletterContext'
import { focusFirstError } from './forms/focusFirstError'
import TextField from './forms/TextField'

/** Newsletter sign-up: validates the address, saves it locally, and confirms on screen. */
export default function NewsletterForm() {
  const { subscribe } = useNewsletter()
  const announce = useAnnounce()
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [done, setDone] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setDone(null)
    const result = subscribe(email)
    if (!result.ok) {
      setError(result.error)
      focusFirstError(formRef.current)
      return
    }
    setError(undefined)
    setEmail('')
    const message = result.alreadySubscribed ? 'You are already on the list.' : 'Thanks for subscribing!'
    setDone(message)
    announce(message)
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading">Get the TechCart newsletter</h2>
      <p>New arrivals and deals, about once a month.</p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="newsletter-form">
        <TextField
          label="Email address"
          type="email"
          name="newsletter-email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={error}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Subscribe
        </button>
      </form>

      {done && (
        <p className="newsletter-done" role="status">
          {done} This is a demo, so no emails are actually sent.
        </p>
      )}
      <p className="newsletter-fine muted small">
        Your address stays in this browser. <Link to="/newsletter/unsubscribe">Unsubscribe</Link> at any time.
      </p>
    </section>
  )
}
