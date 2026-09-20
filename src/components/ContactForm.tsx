import { useRef, useState, type FormEvent } from 'react'
import { useAnnounce } from '../context/AnnouncerContext'
import { useAuth } from '../context/AuthContext'
import { usePersistentState } from '../hooks/usePersistentState'
import { newId, randomHex } from '../lib/auth'
import {
  CONTACT_TOPICS,
  MAX_MESSAGES,
  MESSAGE_MAX,
  sanitizeMessages,
  topicLabel,
  validateContact,
  type ContactErrors,
  type ContactInput,
  type ContactMessage,
} from '../lib/help'
import { STORAGE_KEYS, writeJSON } from '../lib/storage'
import { focusFirstError } from './forms/focusFirstError'
import SelectField from './forms/SelectField'
import TextField from './forms/TextField'

const NO_MESSAGES: ContactMessage[] = []
const TOPIC_OPTIONS = [{ value: '', label: 'Choose a topic' }, ...CONTACT_TOPICS]

/**
 * Contact form. There is no mail server, so a message is saved in this browser
 * only (and listed below the form, where it can be deleted); the form says so.
 */
export default function ContactForm() {
  const { user } = useAuth()
  const announce = useAnnounce()
  const formRef = useRef<HTMLFormElement>(null)
  const [saved, setSaved] = usePersistentState<ContactMessage[]>(STORAGE_KEYS.messages, NO_MESSAGES, sanitizeMessages)
  const [values, setValues] = useState<ContactInput>({ name: user?.name ?? '', email: user?.email ?? '', topic: '', message: '' })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  function set(field: keyof ContactInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setDone(null)
    setFormError(null)
    const found = validateContact(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      focusFirstError(formRef.current)
      return
    }
    if (saved.length >= MAX_MESSAGES) {
      setFormError(`You have ${MAX_MESSAGES} saved messages, the maximum. Delete one below to send another.`)
      return
    }

    const entry: ContactMessage = {
      id: newId(),
      reference: `MSG-${randomHex(3).toUpperCase()}`,
      name: values.name.trim(),
      email: values.email.trim(),
      topic: values.topic as ContactMessage['topic'],
      message: values.message.trim(),
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...saved]
    if (!writeJSON(STORAGE_KEYS.messages, next)) {
      setFormError('Your browser could not save the message. Please try again.')
      return
    }
    setSaved(next)
    setValues((current) => ({ ...current, topic: '', message: '' }))
    const confirmation = `Message ${entry.reference} saved. This is a demo, so it was kept in this browser and not sent to anyone.`
    setDone(confirmation)
    announce(confirmation)
  }

  function remove(entry: ContactMessage) {
    const next = saved.filter((candidate) => candidate.id !== entry.id)
    if (!writeJSON(STORAGE_KEYS.messages, next)) {
      setFormError('Your browser could not remove the message. Please try again.')
      return
    }
    setSaved(next)
    announce(`Message ${entry.reference} deleted`)
  }

  return (
    <section id="contact" className="card card-pad contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">Contact us</h2>
      <p className="muted">
        Can&rsquo;t find your answer? Write to us below. This is a demo with no mail server, so your message is saved in this browser only and nobody reads it.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Contact us">
        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}
        <div className="form-grid">
          <TextField label="Your name" name="name" autoComplete="name" value={values.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />
          <TextField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <SelectField label="What is it about?" name="topic" options={TOPIC_OPTIONS} value={values.topic} error={errors.topic} onChange={(e) => set('topic', e.target.value)} />

        <div className="field">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            maxLength={MESSAGE_MAX}
            value={values.message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={`contact-message-count${errors.message ? ' contact-message-error' : ''}`}
            onChange={(e) => set('message', e.target.value)}
          />
          <span id="contact-message-count" className="hint">
            {values.message.length} / {MESSAGE_MAX.toLocaleString('en-US')} characters
          </span>
          {errors.message && (
            <span id="contact-message-error" className="error">
              {errors.message}
            </span>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Send message
        </button>
      </form>

      {done && (
        <p className="alert" role="status">
          {done}
        </p>
      )}

      {saved.length > 0 && (
        <div className="contact-saved">
          <h3>Your saved messages</h3>
          <ul aria-label="Your saved messages">
            {saved.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.reference}</strong> <span className="muted small">&middot; {topicLabel(entry.topic)} &middot; {new Date(entry.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <p>{entry.message}</p>
                </div>
                <button type="button" className="btn btn-sm btn-danger" aria-label={`Delete message ${entry.reference}`} onClick={() => remove(entry)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
