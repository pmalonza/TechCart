import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUpForm from './SignUpForm'

function fillValidForm(user) {
  return Promise.resolve()
    .then(() => user.type(screen.getByLabelText('Name'), 'Ada Lovelace'))
    .then(() => user.type(screen.getByLabelText('Email'), 'ada@gmail.com'))
    .then(() => user.type(screen.getByLabelText('Password'), 'longenoughpw'))
    .then(() => user.type(screen.getByLabelText('Confirm password'), 'longenoughpw'))
}

describe('SignUpForm', () => {
  it('submits valid details to onSignUp', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn().mockResolvedValue({ ok: true })
    render(<SignUpForm onSignUp={onSignUp} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(onSignUp).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })
  })

  it('clears the form after a successful sign up', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn().mockResolvedValue({ ok: true })
    render(<SignUpForm onSignUp={onSignUp} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })

  it('rejects a name with no letters without calling onSignUp', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn()
    render(<SignUpForm onSignUp={onSignUp} />)

    await user.type(screen.getByLabelText('Name'), '123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name.')
    expect(onSignUp).not.toHaveBeenCalled()
  })

  it('rejects a malformed email', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn()
    render(<SignUpForm onSignUp={onSignUp} />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('supported provider')
    expect(onSignUp).not.toHaveBeenCalled()
  })

  it('rejects a well-formed email from an unsupported provider', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn()
    render(<SignUpForm onSignUp={onSignUp} />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@made-up-domain.com')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('supported provider')
    expect(onSignUp).not.toHaveBeenCalled()
  })

  it('rejects a password shorter than 8 characters', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn()
    render(<SignUpForm onSignUp={onSignUp} />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.type(screen.getByLabelText('Confirm password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters.')
    expect(onSignUp).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn()
    render(<SignUpForm onSignUp={onSignUp} />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'longenoughpw')
    await user.type(screen.getByLabelText('Confirm password'), 'different-pw')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(onSignUp).not.toHaveBeenCalled()
  })

  it('shows the error returned by onSignUp without clearing the form', async () => {
    const user = userEvent.setup()
    const onSignUp = vi.fn().mockResolvedValue({ ok: false, message: 'Email already taken.' })
    render(<SignUpForm onSignUp={onSignUp} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Email already taken.')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@gmail.com')
  })
})
