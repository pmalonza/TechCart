import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { focusFirstError } from '../components/forms/focusFirstError'
import TextField from '../components/forms/TextField'
import { useAnnounce } from '../context/AnnouncerContext'
import { useNewsletter } from '../context/NewsletterContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function UnsubscribePage() {
  const { unsubscribe } = useNewsletter()
  const announce = useAnnounce()
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [done, setDone] = useState<string | null>(null)
  useDocumentTitle('Unsubscribe from the newsletter')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setDone(null)
    const result = unsubscribe(email)
    if (!result.ok) {
      setError(result.error)
      focusFirstError(formRef.current)
      return
    }
    setError(undefined)
    const address = email.trim()
    setEmail('')
    const message = result.wasSubscribed ? `${address} has been unsubscribed.` : `${address} was not on the list, so there is nothing to remove.`
    setDone(message)
    announce(message)
  }

  return (
    <div className="container page">
      <div className="auth-card card card-pad">
        <h1>Unsubscribe from the newsletter</h1>
        <p>Enter the address you signed up with and we will remove it from the list.</p>

        <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Unsubscribe">
          <TextField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            error={error}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-block">
            Unsubscribe
          </button>
        </form>

        {done && (
          <p className="alert" role="status">
            {done}
          </p>
        )}
        <p className="auth-switch">
          <Link to="/">Back to the shop</Link>
        </p>
      </div>
    </div>
  )
}
