import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignInForm from './SignInForm'

describe('SignInForm', () => {
  it('submits email and password to onSignIn', async () => {
    const user = userEvent.setup()
    const onSignIn = vi.fn().mockResolvedValue({ ok: true })
    render(<SignInForm onSignIn={onSignIn} />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'hunter22')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(onSignIn).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'hunter22' })
  })

  it('rejects an empty submission without calling onSignIn', async () => {
    const user = userEvent.setup()
    const onSignIn = vi.fn()
    render(<SignInForm onSignIn={onSignIn} />)

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email and password.')
    expect(onSignIn).not.toHaveBeenCalled()
  })

  it('shows the error returned by onSignIn and keeps the entered email', async () => {
    const user = userEvent.setup()
    const onSignIn = vi.fn().mockResolvedValue({ ok: false, message: 'Incorrect password.' })
    render(<SignInForm onSignIn={onSignIn} />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password.')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
  })

  it('clears the form after a successful sign in', async () => {
    const user = userEvent.setup()
    const onSignIn = vi.fn().mockResolvedValue({ ok: true })
    render(<SignInForm onSignIn={onSignIn} />)

    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Password'), 'hunter22')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByLabelText('Email')).toHaveValue('')
  })
})
