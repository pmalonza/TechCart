import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './icons'

interface BackButtonProps {
  /** Where to go when there is no earlier page in this visit (e.g. the visitor opened the link directly). */
  fallback?: string
  label?: string
}

/**
 * Goes back one step in the visitor's history. React Router marks the very
 * first entry of a visit with the key "default"; there is nothing to go back
 * to from there, and `navigate(-1)` could leave the site entirely, so it goes
 * to `fallback` instead.
 */
export default function BackButton({ fallback = '/', label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasEarlierPage = location.key !== 'default'

  return (
    <button
      type="button"
      className="back-button"
      onClick={() => (hasEarlierPage ? navigate(-1) : navigate(fallback))}
    >
      <ArrowLeftIcon className="back-button-icon" />
      {label}
    </button>
  )
}
