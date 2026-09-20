import { Link } from 'react-router-dom'

/**
 * Stand-in for the email a real store would send. There is no mail server in
 * this demo, so the message that would have been emailed is shown on screen.
 */
export default function DemoInbox({ to, resetPath }: { to: string; resetPath: string }) {
  return (
    <aside className="demo-inbox" aria-label="Demo inbox">
      <p className="demo-inbox-badge">Demo inbox</p>
      <p className="muted small">
        TechCart has no mail server, so instead of emailing you, the message is shown here. In a real store this would arrive in your inbox.
      </p>
      <div className="demo-email">
        <p>
          <strong>To:</strong> {to}
        </p>
        <p>
          <strong>Subject:</strong> Reset your TechCart password
        </p>
        <p>Someone asked to reset the password for this account. If that was you, use the link below within 30 minutes. If it was not, you can ignore this message.</p>
        <p>
          <Link to={resetPath}>Reset my password</Link>
        </p>
      </div>
    </aside>
  )
}
