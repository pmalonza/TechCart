import { useState } from 'react'
import SignUpForm from './SignUpForm'
import SignInForm from './SignInForm'

export default function AuthSection({ currentUser, onSignUp, onSignIn, onSignOut }) {
  const [mode, setMode] = useState('signin')
  const [justCreated, setJustCreated] = useState('')

  async function handleSignUp(details) {
    const result = await onSignUp(details)
    if (result.ok) {
      setJustCreated(details.name)
      setMode('signin')
    }
    return result
  }

  if (currentUser) {
    return (
      <div className="auth-section auth-section-signed-in">
        <span>
          Signed in as <strong>{currentUser.name}</strong>
        </span>
        <button type="button" className="text-button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <details className="auth-section" open>
      <summary>Account</summary>
      {justCreated && (
        <p className="auth-success" role="status">
          Account created for {justCreated}. Sign in below.
        </p>
      )}
      <div className="auth-tabs" role="tablist" aria-label="Account access">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={mode === 'signin' ? 'auth-tab auth-tab-active' : 'auth-tab'}
          onClick={() => setMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'auth-tab auth-tab-active' : 'auth-tab'}
          onClick={() => setMode('signup')}
        >
          Create account
        </button>
      </div>
      {mode === 'signin' ? (
        <SignInForm onSignIn={onSignIn} />
      ) : (
        <SignUpForm onSignUp={handleSignUp} />
      )}
    </details>
  )
}
