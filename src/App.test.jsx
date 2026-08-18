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

  it('creates an account and persists it to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('Create account', { selector: 'summary' }))
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

    await user.click(screen.getByText('Create account', { selector: 'summary' }))
    await fillSignUpForm(user, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

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
})
