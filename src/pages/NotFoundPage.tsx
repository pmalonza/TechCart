import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container page empty-state">
      <h1>Page not found</h1>
      <p>We could not find the page you were looking for.</p>
      <Link className="btn btn-primary" to="/">
        Back to home
      </Link>
    </div>
  )
}
