import { useRef, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Renders its children only for a signed-in user.
 *
 * A visitor who was never signed in is sent to the sign-in page and back
 * afterwards. A visitor who *was* signed in and no longer is (they signed out,
 * deleted their account, or signed out in another tab) goes home instead:
 * sending them to a sign-in form they did not ask for would be jarring.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  const wasSignedIn = useRef(false)

  if (user) {
    wasSignedIn.current = true
    return <>{children}</>
  }
  if (wasSignedIn.current) return <Navigate to="/" replace />
  return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, search: location.search } }} />
}
