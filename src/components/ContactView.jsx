import { useState } from 'react'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactView({ onBack }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Enter your name.')
      return
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    if (!form.message.trim()) {
      setError('Enter a message.')
      return
    }

    setError('')
    setSent(true)
  }

  if (sent) {
    return (
      <section className="contact-view" aria-label="Contact us">
        <button type="button" className="text-button" onClick={onBack}>
          &larr; Back
        </button>
        <h2>Contact us</h2>
        <p role="status" className="auth-success">
          Thanks, {form.name}. Your message has been sent — we'll reply to {form.email} soon.
        </p>
      </section>
    )
  }

  return (
    <section className="contact-view" aria-label="Contact us">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Contact us</h2>
      <p>Questions about an order or a product? Send us a message and we'll get back to you.</p>
      <form className="auth-form contact-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" value={form.name} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="field contact-message-field">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="add-button">
          Send message
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
