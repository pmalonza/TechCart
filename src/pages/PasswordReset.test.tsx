import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEYS } from '../lib/storage'
import { renderApp } from '../test/utils'

type User = ReturnType<typeof userEvent.setup>

const ADA = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'correct8horse' }

/** Creates Ada's account, then signs out, leaving no view mounted. */
async function accountExists(user: User) {
  const view = renderApp('/register')
  await user.type(screen.getByLabelText('Full name'), ADA.name)
  await user.type(screen.getByLabelText('Email'), ADA.email)
  await user.type(screen.getByLabelText('Password'), ADA.password)
  await user.type(screen.getByLabelText('Confirm password'), ADA.password)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  await screen.findByRole('heading', { level: 1, name: 'My account' })
  await user.click(screen.getByRole('button', { name: 'Sign out' }))
  view.unmount()
}

/** Requests a reset for `email` and returns the demo-inbox link's path, or null if none was shown. */
async function requestReset(user: User, email = ADA.email) {
  await user.type(screen.getByLabelText('Email'), email)
  await user.click(screen.getByRole('button', { name: 'Send reset link' }))
  await screen.findByRole('status')
  const link = screen.queryByRole('link', { name: 'Reset my password' })
  return link ? link.getAttribute('href') : null
}

async function newPassword(user: User, password: string, confirm = password) {
  await user.type(screen.getByLabelText('New password'), password)
  await user.type(screen.getByLabelText('Confirm new password'), confirm)
  await user.click(screen.getByRole('button', { name: 'Set new password' }))
}

const tokenFrom = (path: string) => new URL(path, 'http://localhost').searchParams.get('token')!

describe('forgot password', () => {
  it('is reachable from the sign-in page', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await user.click(screen.getByRole('link', { name: 'Forgot your password?' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Reset your password' })).toBeInTheDocument()
  })

  it('validates the email before sending anything', async () => {
    const user = userEvent.setup()
    renderApp('/forgot-password')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.resetTokens) ?? '[]')).toEqual([])
  })

  it('shows the demo inbox with a reset link for a real account', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    renderApp('/forgot-password')
    const path = await requestReset(user)

    expect(screen.getByRole('status')).toHaveTextContent(/if an account exists for ada@example\.com/i)
    const inbox = screen.getByRole('complementary', { name: 'Demo inbox' })
    expect(within(inbox).getByText(/has no mail server/i)).toBeInTheDocument()
    expect(path).toMatch(/^\/reset-password\?token=[0-9a-f]{64}$/)
  })

  it('gives the same message for an unknown email but shows no demo email', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    renderApp('/forgot-password')
    const path = await requestReset(user, 'nobody@example.com')

    expect(screen.getByRole('status')).toHaveTextContent(/if an account exists for nobody@example\.com/i)
    expect(path).toBeNull()
    expect(screen.queryByRole('complementary', { name: 'Demo inbox' })).not.toBeInTheDocument()
  })

  it('never stores the reset token itself, only a hash of it', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    renderApp('/forgot-password')
    const path = await requestReset(user)

    const stored = window.localStorage.getItem(STORAGE_KEYS.resetTokens)!
    expect(stored).not.toContain(tokenFrom(path!))
    expect(JSON.parse(stored)[0].tokenHash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('resetting the password', () => {
  it('sets a new password that works, and the old one no longer does', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    const forgot = renderApp('/forgot-password')
    const path = await requestReset(user)
    forgot.unmount()

    renderApp(path!)
    expect(await screen.findByRole('heading', { level: 1, name: 'Choose a new password' })).toBeInTheDocument()
    await newPassword(user, 'brandnew123')
    expect(await screen.findByRole('heading', { level: 1, name: 'Password updated' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Go to sign in' }))
    await user.type(screen.getByLabelText('Email'), ADA.email)
    await user.type(screen.getByLabelText('Password'), ADA.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'brandnew123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'My account' })).toBeInTheDocument()
  })

  it('validates the new password', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    const forgot = renderApp('/forgot-password')
    const path = await requestReset(user)
    forgot.unmount()

    renderApp(path!)
    await screen.findByRole('heading', { name: 'Choose a new password' })
    await newPassword(user, 'weak', 'different')
    expect(screen.getByText(/use at least 8 characters/i, { selector: '.error' })).toBeInTheDocument()
    expect(screen.getByText('The passwords do not match.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument()
  })

  it('makes the link single-use', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    const forgot = renderApp('/forgot-password')
    const path = await requestReset(user)
    forgot.unmount()

    const first = renderApp(path!)
    await screen.findByRole('heading', { name: 'Choose a new password' })
    await newPassword(user, 'brandnew123')
    await screen.findByRole('heading', { name: 'Password updated' })
    first.unmount()

    renderApp(path!)
    expect(await screen.findByRole('heading', { name: 'This link has expired' })).toBeInTheDocument()
  })

  it('invalidates an older link when a newer one is requested', async () => {
    const user = userEvent.setup()
    await accountExists(user)

    const first = renderApp('/forgot-password')
    const olderPath = await requestReset(user)
    first.unmount()
    const second = renderApp('/forgot-password')
    const newerPath = await requestReset(user)
    second.unmount()
    expect(olderPath).not.toBe(newerPath)

    const oldView = renderApp(olderPath!)
    expect(await screen.findByRole('heading', { name: 'This link has expired' })).toBeInTheDocument()
    oldView.unmount()

    renderApp(newerPath!)
    expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument()
  })

  it('rejects an expired link', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    const forgot = renderApp('/forgot-password')
    const path = await requestReset(user)
    forgot.unmount()

    const records = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.resetTokens)!)
    records[0].expiresAt = Date.now() - 1000
    window.localStorage.setItem(STORAGE_KEYS.resetTokens, JSON.stringify(records))

    renderApp(path!)
    expect(await screen.findByRole('heading', { name: 'This link has expired' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute('href', '/forgot-password')
  })

  it.each(['/reset-password', '/reset-password?token=', '/reset-password?token=not-a-real-token'])('rejects %s', async (path) => {
    renderApp(path)
    expect(await screen.findByRole('heading', { name: 'This link has expired' })).toBeInTheDocument()
  })

  it('does not sign anyone in by itself', async () => {
    const user = userEvent.setup()
    await accountExists(user)
    const forgot = renderApp('/forgot-password')
    const path = await requestReset(user)
    forgot.unmount()

    renderApp(path!)
    await screen.findByRole('heading', { name: 'Choose a new password' })
    await newPassword(user, 'brandnew123')
    await screen.findByRole('heading', { name: 'Password updated' })
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })
})
