import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

function fillSignUpForm(user, { name, email, password }) {
  return Promise.resolve()
    .then(() => user.type(screen.getByLabelText('Name'), name))
    .then(() => user.type(screen.getByLabelText('Email'), email))
    .then(() => user.type(screen.getByLabelText('Password'), password))
    .then(() => user.type(screen.getByLabelText('Confirm password'), password))
}

describe('App', () => {
  it('opens a product detail view when a card is clicked, and returns via Back', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))

    expect(screen.getByRole('heading', { name: 'VividView 55" 4K QLED TV' })).toBeInTheDocument()
    expect(screen.getByText('Electronics › TVs')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Electronics' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back to products/ }))

    expect(screen.queryByText('Electronics › TVs')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
    // The product is back in the list (as a card, not the detail view).
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
  })

  it('renders all products by default', () => {
    render(<App />)
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.getByText('Nova X12 Smartphone')).toBeInTheDocument()
  })

  it('filters to a category when selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))

    expect(screen.getByText('Nova X12 Smartphone')).toBeInTheDocument()
    expect(screen.queryByText('AeroBook 14" Ultralight Laptop')).not.toBeInTheDocument()
  })

  it('narrows further to a subcategory when selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Electronics' }))
    await user.click(screen.getByRole('button', { name: 'TVs' }))

    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
    expect(screen.queryByText('SweepMaster Robot Vacuum')).not.toBeInTheDocument()
  })

  it('resets the subcategory when switching categories', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Electronics' }))
    await user.click(screen.getByRole('button', { name: 'TVs' }))
    await user.click(screen.getByRole('button', { name: 'Computers' }))

    expect(screen.getByRole('button', { name: 'All Computers' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.getByText('27" 1440p Monitor')).toBeInTheDocument()
  })

  it('returns to all products when "All products" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))
    await user.click(screen.getByRole('button', { name: 'All products' }))

    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All Phones' })).not.toBeInTheDocument()
  })

  async function goToSignUpTab(user) {
    await user.click(screen.getByRole('tab', { name: 'Create account' }))
  }

  it('creates an account and persists it to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('status')).toHaveTextContent('Account created for Ada Lovelace')

    const stored = JSON.parse(window.localStorage.getItem('techcart:accounts'))
    expect(stored).toHaveLength(1)
    expect(stored[0].email).toBe('ada@example.com')
    expect(stored[0].passwordHash).not.toBe('longenoughpw')
  })

  it('rejects signing up twice with the same email', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Someone Else',
      email: 'ADA@example.com',
      password: 'anotherlongpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('An account with this email already exists.')
    const stored = JSON.parse(window.localStorage.getItem('techcart:accounts'))
    expect(stored).toHaveLength(1)
  })

  it('signs in with correct credentials and persists the session', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'longenoughpw')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('techcart:session'))).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    })
  })

  it('rejects sign in with the wrong password', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password.')
    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
  })

  it('rejects sign in for an email with no account', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Email'), 'nobody@example.com')
    await user.type(screen.getByLabelText('Password'), 'whatever123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No account found with that email.')
  })

  it('signs out and clears the session', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'longenoughpw')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('techcart:session')).toBeNull()
  })
})
