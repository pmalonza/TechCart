import { NavLink, Outlet } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import { useAnnounce } from '../../context/AnnouncerContext'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

function accountLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'account-link active' : 'account-link'
}

/** Shell for every signed-in account page: a section nav beside the page content. */
export default function AccountLayout() {
  const { user, signOut } = useAuth()
  const announce = useAnnounce()
  useDocumentTitle('My account')

  function handleSignOut() {
    signOut()
    announce('You have been signed out')
  }

  return (
    <div className="container page">
      <div className="page-top">
        <BackButton fallback="/" />
      </div>
      <header className="page-header">
        <h1>My account</h1>
        <p>Signed in as {user?.name}</p>
      </header>

      <div className="account-layout">
        <nav className="account-nav" aria-label="Account">
          <NavLink to="/account" end className={accountLinkClass}>
            Profile
          </NavLink>
          <NavLink to="/account/security" className={accountLinkClass}>
            Password &amp; security
          </NavLink>
          <button type="button" className="account-link account-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </nav>
        <div className="account-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
