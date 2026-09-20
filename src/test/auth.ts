import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './utils'

export type UserSession = ReturnType<typeof userEvent.setup>

export const ADA = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'correct8horse' }

/** Registers an account through the real sign-up form and leaves the app on the account page. */
export async function registerAndLand(details = ADA, startAt = '/register') {
  const user = userEvent.setup()
  const view = renderApp(startAt)
  await user.type(screen.getByLabelText('Full name'), details.name)
  await user.type(screen.getByLabelText('Email'), details.email)
  await user.type(screen.getByLabelText('Password'), details.password)
  await user.type(screen.getByLabelText('Confirm password'), details.password)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
  await screen.findByRole('heading', { level: 1, name: 'My account' })
  return { user, view }
}
