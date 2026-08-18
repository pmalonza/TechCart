import { useState } from 'react'
import SignUpForm from './SignUpForm'

export default function AuthSection({ onSignUp }) {
  const [justCreated, setJustCreated] = useState('')

  async function handleSignUp(details) {
    const result = await onSignUp(details)
    if (result.ok) {
      setJustCreated(details.name)
    }
    return result
  }

  return (
    <details className="auth-section">
      <summary>Create account</summary>
      {justCreated && (
        <p className="auth-success" role="status">
          Account created for {justCreated}. (Sign in coming soon.)
        </p>
      )}
      <SignUpForm onSignUp={handleSignUp} />
    </details>
  )
}
