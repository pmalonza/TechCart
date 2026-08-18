import { useState } from 'react'

export default function VerifyEmailForm({ email, demoCode, onVerify, onCancel }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setSubmitting(true)
    const result = await onVerify({ email, code: code.trim() })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setError('')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <p role="status" className="auth-success">
        A verification code was sent to {email}. For this demo, the code is {demoCode}.
      </p>
      <div className="field">
        <label htmlFor="verify-code">Verification code</label>
        <input
          id="verify-code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </div>
      <button type="submit" className="add-button" disabled={submitting}>
        {submitting ? 'Verifying…' : 'Verify'}
      </button>
      <button type="button" className="text-button" onClick={onCancel}>
        Cancel
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
