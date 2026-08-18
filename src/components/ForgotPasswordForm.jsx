import { useState } from 'react'

export default function ForgotPasswordForm({ onRequestReset, onResetPassword, onCancel }) {
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  function handleRequestSubmit(event) {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const result = onRequestReset(trimmedEmail)
    if (!result.ok) {
      setError(result.message)
      return
    }

    setError('')
    setInfo(`A reset code was sent to ${trimmedEmail}. For this demo, the code is ${result.code}.`)
    setStep('reset')
  }

  async function handleResetSubmit(event) {
    event.preventDefault()

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const result = await onResetPassword({
      email: email.trim(),
      code: code.trim(),
      newPassword,
    })
    if (!result.ok) {
      setError(result.message)
      return
    }

    setError('')
    setInfo('Password reset. You can now sign in with your new password.')
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="auth-form">
        <p role="status" className="auth-success">
          {info}
        </p>
        <button type="button" className="text-button" onClick={onCancel}>
          Back to sign in
        </button>
      </div>
    )
  }

  if (step === 'reset') {
    return (
      <form className="auth-form" onSubmit={handleResetSubmit} noValidate>
        <div className="field">
          <label htmlFor="reset-code">Reset code</label>
          <input id="reset-code" type="text" value={code} onChange={(event) => setCode(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="reset-new-password">New password</label>
          <input
            id="reset-new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="reset-confirm-password">Confirm new password</label>
          <input
            id="reset-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <button type="submit" className="add-button">
          Reset password
        </button>
        <button type="button" className="text-button" onClick={onCancel}>
          Back to sign in
        </button>
        {info && (
          <p role="status" className="auth-success">
            {info}
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleRequestSubmit} noValidate>
      <div className="field">
        <label htmlFor="reset-email">Email</label>
        <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <button type="submit" className="add-button">
        Send reset code
      </button>
      <button type="button" className="text-button" onClick={onCancel}>
        Back to sign in
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
