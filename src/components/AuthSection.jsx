import { useState } from 'react'
import SignUpForm from './SignUpForm'
import SignInForm from './SignInForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import VerifyEmailForm from './VerifyEmailForm'

export default function AuthSection({
  currentUser,
  onSignUp,
  onVerifySignUp,
  onSignIn,
  onVerifySignIn,
  onSignOut,
  onViewProfile,
  onRequestPasswordReset,
  onResetPassword,
}) {
  const [mode, setMode] = useState('signin')
  const [justCreated, setJustCreated] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyDemoCode, setVerifyDemoCode] = useState('')

  async function handleSignUp(details) {
    const result = await onSignUp(details)
    if (result.ok && result.requiresVerification) {
      setVerifyEmail(details.email)
      setVerifyDemoCode(result.code)
      setMode('signup-verify')
    }
    return result
  }

  async function handleVerifySignUp(details) {
    const result = await onVerifySignUp(details)
    if (result.ok) {
      setJustCreated(result.name)
      setMode('signin')
    }
    return result
  }

  async function handleSignIn(details) {
    const result = await onSignIn(details)
    if (result.ok && result.requiresVerification) {
      setVerifyEmail(details.email)
      setVerifyDemoCode(result.code)
      setMode('verify')
    }
    return result
  }

  async function handleVerifySignIn(details) {
    const result = await onVerifySignIn(details)
    if (result.ok) {
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
        <button type="button" className="text-button" onClick={onViewProfile}>
          Profile
        </button>
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
      {mode === 'verify' ? (
        <VerifyEmailForm
          email={verifyEmail}
          demoCode={verifyDemoCode}
          onVerify={handleVerifySignIn}
          onCancel={() => setMode('signin')}
        />
      ) : mode === 'signup-verify' ? (
        <VerifyEmailForm
          email={verifyEmail}
          demoCode={verifyDemoCode}
          onVerify={handleVerifySignUp}
          onCancel={() => setMode('signup')}
        />
      ) : mode === 'reset' ? (
        <ForgotPasswordForm
          onRequestReset={onRequestPasswordReset}
          onResetPassword={onResetPassword}
          onCancel={() => setMode('signin')}
        />
      ) : (
        <>
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
            <SignInForm onSignIn={handleSignIn} onForgotPassword={() => setMode('reset')} />
          ) : (
            <SignUpForm onSignUp={handleSignUp} />
          )}
        </>
      )}
    </details>
  )
}
