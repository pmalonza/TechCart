import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

/** Renders the whole app (all providers and routes) at a given URL. */
export function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}
