import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

/**
 * Renders the whole app (all providers and routes). Pass a URL, or a list of
 * URLs to seed the history; the visit starts on the last one, so earlier
 * entries are available to "go back" to.
 */
export function renderApp(route: string | string[] = '/') {
  const entries = Array.isArray(route) ? route : [route]
  return render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <App />
    </MemoryRouter>,
  )
}
