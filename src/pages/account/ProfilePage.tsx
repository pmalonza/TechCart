import { useRef, useState, type FormEvent } from 'react'
import { focusFirstError } from '../../components/forms/focusFirstError'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { validateEmail, validateName } from '../../lib/auth'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  if (!user) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    const next = { name: validateName(name) ?? undefined, email: validateEmail(email) ?? undefined }
    setErrors(next)
    if (next.name || next.email) {
      focusFirstError(formRef.current)
      return
    }
    const result = updateProfile({ name, email })
    setMessage(result.ok ? { kind: 'success', text: 'Your profile has been updated.' } : { kind: 'error', text: result.error })
  }

  return (
    <section aria-labelledby="profile-heading" className="card card-pad">
      <h2 id="profile-heading">Profile</h2>
      <p className="muted">Update the name and email on your account.</p>

      {message && (
        <div className={message.kind === 'success' ? 'alert alert-success' : 'alert alert-error'} role={message.kind === 'success' ? 'status' : 'alert'}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="form-narrow">
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
        <p className="muted small">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </form>
    </section>
  )
}
