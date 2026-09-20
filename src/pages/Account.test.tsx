import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEYS } from '../lib/storage'
import { renderApp } from '../test/utils'

type User = ReturnType<typeof userEvent.setup>

const ADA = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'correct8horse' }

async function register(user: User, details = ADA) {
  await user.type(screen.getByLabelText('Full name'), details.name)
  await user.type(screen.getByLabelText('Email'), details.email)
  await user.type(screen.getByLabelText('Password'), details.password)
  await user.type(screen.getByLabelText('Confirm password'), details.password)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

async function login(user: User, email = ADA.email, password = ADA.password) {
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

/** Registers Ada from a fresh start and leaves the app on her account page. */
async function signedInAsAda() {
  const user = userEvent.setup()
  const view = renderApp('/register')
  await register(user)
  await screen.findByRole('heading', { level: 1, name: 'My account' })
  return { user, view }
}

const storedUsers = () => window.localStorage.getItem(STORAGE_KEYS.users)

describe('header account link', () => {
  it('offers sign in when signed out', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })

  it('links to the account page when signed in', async () => {
    await signedInAsAda()
    expect(screen.getByRole('link', { name: 'My account (Ada Lovelace)' })).toHaveAttribute('href', '/account')
  })
})

describe('registration', () => {
  it('creates an account and signs the visitor in', async () => {
    const user = userEvent.setup()
    renderApp('/register')
    await register(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'My account' })).toBeInTheDocument()
    expect(screen.getByText('Signed in as Ada Lovelace')).toBeInTheDocument()
  })

  it('shows an error for every empty field and focuses the first', async () => {
    const user = userEvent.setup()
    renderApp('/register')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a password.')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true')
    await vi.waitFor(() => expect(screen.getByLabelText('Full name')).toHaveFocus())
    expect(JSON.parse(storedUsers() ?? '[]')).toEqual([])
  })

  it('ties each error to its field for assistive tech', async () => {
    const user = userEvent.setup()
    renderApp('/register')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription('Enter your name.')
  })

  it('rejects an invalid email, a weak password and mismatched confirmation', async () => {
    const user = userEvent.setup()
    renderApp('/register')
    await user.type(screen.getByLabelText('Full name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.type(screen.getByLabelText('Confirm password'), 'different')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(screen.getByText(/use at least 8 characters/i, { selector: '.error' })).toBeInTheDocument()
    expect(screen.getByText('The passwords do not match.')).toBeInTheDocument()
  })

  it('refuses a duplicate email, case-insensitively', async () => {
    const { user } = await signedInAsAda()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await user.click(screen.getByRole('link', { name: 'Sign in' }))
    await user.click(screen.getByRole('link', { name: 'Create an account' }))
    await register(user, { ...ADA, name: 'Someone Else', email: 'ADA@Example.COM' })
    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i)
  })

  it('never stores the password in the clear', async () => {
    await signedInAsAda()
    const stored = storedUsers()!
    expect(stored).not.toContain(ADA.password)
    expect(JSON.parse(stored)[0]).toMatchObject({ email: ADA.email, name: ADA.name })
    expect(JSON.parse(stored)[0].passwordHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('has a link to sign in instead', () => {
    renderApp('/register')
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })
})

describe('signing in', () => {
  async function accountExistsButSignedOut() {
    const { user } = await signedInAsAda()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    return user
  }

  it('signs in with the right credentials', async () => {
    const user = await accountExistsButSignedOut()
    await user.click(screen.getByRole('link', { name: 'Sign in' }))
    await login(user)
    expect(await screen.findByRole('heading', { level: 1, name: 'My account' })).toBeInTheDocument()
  })

  it('accepts the email in any case and with stray spaces', async () => {
    const user = await accountExistsButSignedOut()
    await user.click(screen.getByRole('link', { name: 'Sign in' }))
    await login(user, '  ADA@example.com ')
    expect(await screen.findByRole('heading', { level: 1, name: 'My account' })).toBeInTheDocument()
  })

  it('gives the same generic error for a wrong password and an unknown email', async () => {
    const user = await accountExistsButSignedOut()
    await user.click(screen.getByRole('link', { name: 'Sign in' }))

    await login(user, ADA.email, 'wrongpass1')
    const wrongPassword = (await screen.findByRole('alert')).textContent

    await user.clear(screen.getByLabelText('Email'))
    await user.clear(screen.getByLabelText('Password'))
    await login(user, 'nobody@example.com', 'wrongpass1')
    await vi.waitFor(() => expect(screen.getByRole('alert').textContent).toBe(wrongPassword))
    expect(wrongPassword).toBe('Incorrect email or password.')
  })

  it('validates empty fields before trying', async () => {
    renderApp('/login')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  })

  it('sends a signed-out visitor from a protected page to sign in, then back to it', async () => {
    const user = userEvent.setup()
    // Create the account first, then start a new visit that is signed out.
    const first = renderApp('/register')
    await register(user)
    await screen.findByRole('heading', { name: 'My account' })
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    first.unmount()

    renderApp('/account/security')
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    await login(user)
    expect(await screen.findByRole('heading', { level: 2, name: 'Change password' })).toBeInTheDocument()
  })

  it('bounces a signed-in visitor away from the sign-in page', async () => {
    const { user, view } = await signedInAsAda()
    view.unmount()
    renderApp('/login')
    expect(await screen.findByRole('heading', { level: 1, name: 'My account' })).toBeInTheDocument()
    expect(user).toBeDefined()
  })

  it('signs out and returns home', async () => {
    const { user } = await signedInAsAda()
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(screen.getByRole('heading', { level: 1, name: /gadgets you will actually use/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByTestId('announcer')).toHaveTextContent('You have been signed out')
  })

  it('keeps you signed in across a reload', async () => {
    const { view } = await signedInAsAda()
    view.unmount()
    renderApp('/')
    expect(screen.getByRole('link', { name: 'My account (Ada Lovelace)' })).toBeInTheDocument()
  })

  it('redirects to sign in when the account page is opened while signed out', async () => {
    renderApp('/account')
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    const box = screen.getByLabelText('Password')
    expect(box).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(box).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(box).toHaveAttribute('type', 'password')
  })
})

describe('profile', () => {
  it('shows the current details and saves changes', async () => {
    const { user } = await signedInAsAda()
    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')

    await user.clear(screen.getByLabelText('Full name'))
    await user.type(screen.getByLabelText('Full name'), 'Ada King')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('status')).toHaveTextContent('Your profile has been updated.')
    expect(screen.getByText('Signed in as Ada King')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'My account (Ada King)' })).toBeInTheDocument()
  })

  it('validates before saving', async () => {
    const { user } = await signedInAsAda()
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(screen.getByText('Signed in as Ada Lovelace')).toBeInTheDocument()
  })

  it('refuses an email that another account already uses', async () => {
    const user = userEvent.setup()
    const first = renderApp('/register')
    await register(user, { name: 'Grace Hopper', email: 'grace@example.com', password: 'cobol1959x' })
    await screen.findByRole('heading', { name: 'My account' })
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    first.unmount()

    renderApp('/register')
    await register(user)
    await screen.findByRole('heading', { name: 'My account' })
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/another account already uses this email/i)
  })
})

describe('password & security', () => {
  const openSecurity = async (user: User) => {
    await user.click(screen.getByRole('link', { name: 'Password & security' }))
    await screen.findByRole('heading', { level: 2, name: 'Change password' })
  }

  it('rejects the wrong current password', async () => {
    const { user } = await signedInAsAda()
    await openSecurity(user)
    await user.type(screen.getByLabelText('Current password'), 'not-my-password1')
    await user.type(screen.getByLabelText('New password'), 'brandnew123')
    await user.type(screen.getByLabelText('Confirm new password'), 'brandnew123')
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Your current password is incorrect.')
  })

  it('validates the new password and its confirmation', async () => {
    const { user } = await signedInAsAda()
    await openSecurity(user)
    await user.type(screen.getByLabelText('Current password'), ADA.password)
    await user.type(screen.getByLabelText('New password'), 'weak')
    await user.type(screen.getByLabelText('Confirm new password'), 'other')
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(screen.getByText(/use at least 8 characters/i, { selector: '.error' })).toBeInTheDocument()
    expect(screen.getByText('The passwords do not match.')).toBeInTheDocument()
  })

  it('will not reuse the current password', async () => {
    const { user } = await signedInAsAda()
    await openSecurity(user)
    await user.type(screen.getByLabelText('Current password'), ADA.password)
    await user.type(screen.getByLabelText('New password'), ADA.password)
    await user.type(screen.getByLabelText('Confirm new password'), ADA.password)
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/different from your current one/i)
  })

  it('changes the password so only the new one works afterwards', async () => {
    const { user } = await signedInAsAda()
    await openSecurity(user)
    await user.type(screen.getByLabelText('Current password'), ADA.password)
    await user.type(screen.getByLabelText('New password'), 'brandnew123')
    await user.type(screen.getByLabelText('Confirm new password'), 'brandnew123')
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Your password has been changed.')
    expect(screen.getByLabelText('Current password')).toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await user.click(screen.getByRole('link', { name: 'Sign in' }))
    await login(user, ADA.email, ADA.password)
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')

    await user.clear(screen.getByLabelText('Email'))
    await user.clear(screen.getByLabelText('Password'))
    await login(user, ADA.email, 'brandnew123')
    expect(await screen.findByRole('heading', { level: 1, name: 'My account' })).toBeInTheDocument()
  })

  it('deletes the account only after confirming with the password', async () => {
    const { user } = await signedInAsAda()
    await openSecurity(user)
    await user.click(screen.getByRole('button', { name: 'Delete my account' }))

    await user.type(screen.getByLabelText('Confirm with your password'), 'wrongpass1')
    await user.click(screen.getByRole('button', { name: 'Permanently delete account' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That password is incorrect.')

    await user.clear(screen.getByLabelText('Confirm with your password'))
    await user.type(screen.getByLabelText('Confirm with your password'), ADA.password)
    await user.click(screen.getByRole('button', { name: 'Permanently delete account' }))

    expect(await screen.findByRole('heading', { level: 1, name: /gadgets you will actually use/i })).toBeInTheDocument()
    expect(JSON.parse(storedUsers()!)).toEqual([])

    await user.click(screen.getByRole('link', { name: 'Sign in' }))
    await login(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
  })

  it('lets you back out of deleting', async () => {
    const { user } = await signedInAsAda()
    await openSecurity(user)
    await user.click(screen.getByRole('button', { name: 'Delete my account' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeInTheDocument()
    expect(JSON.parse(storedUsers()!)).toHaveLength(1)
  })
})
