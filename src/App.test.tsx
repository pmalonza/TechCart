import { screen } from '@testing-library/react'
import { renderApp } from './test/utils'

describe('App shell', () => {
  it('renders the home page inside the layout', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1, name: /gadgets you will actually use/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /techcart/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main')
  })

  it('renders a not-found page for unknown routes', () => {
    renderApp('/nope')
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
