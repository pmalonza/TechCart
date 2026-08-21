import { useState } from 'react'

export default function ProfileView({ user, onBack, onUpdateProfile, onViewAddresses }) {
  const [name, setName] = useState(user.name)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const trimmed = name.trim()
    if (!/\p{L}/u.test(trimmed)) {
      setError('Enter your name.')
      setStatus('')
      return
    }

    setError('')
    onUpdateProfile({ name: trimmed })
    setStatus('Profile updated.')
  }

  return (
    <section className="profile-view" aria-label="Profile">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Profile</h2>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setStatus('')
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" value={user.email} disabled readOnly />
        </div>
        <button type="submit" className="add-button">
          Save
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
      <p className="help-view-more">
        <button type="button" className="text-button" onClick={onViewAddresses}>
          Manage addresses
        </button>
      </p>
    </section>
  )
}
