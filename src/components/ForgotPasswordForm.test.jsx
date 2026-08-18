import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordForm from './ForgotPasswordForm'

describe('ForgotPasswordForm', () => {
  it('calls onCancel from the request step', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ForgotPasswordForm onRequestReset={vi.fn()} onResetPassword={vi.fn()} onCancel={onCancel} />,
    )

    await user.click(screen.getByRole('button', { name: 'Back to sign in' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows an error and stays on the request step when the email is not found', async () => {
    const user = userEvent.setup()
    const onRequestReset = vi.fn(() => ({ ok: false, message: 'No account found with that email.' }))
    render(
      <ForgotPasswordForm onRequestReset={onRequestReset} onResetPassword={vi.fn()} onCancel={vi.fn()} />,
    )

    await user.type(screen.getByLabelText('Email'), 'nobody@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(onRequestReset).toHaveBeenCalledWith('nobody@gmail.com')
    expect(screen.getByRole('alert')).toHaveTextContent('No account found with that email.')
    expect(screen.queryByLabelText('Reset code')).not.toBeInTheDocument()
  })

  it('advances to the reset step and shows the demo code after a successful request', async () => {
    const user = userEvent.setup()
    const onRequestReset = vi.fn(() => ({ ok: true, code: '123456' }))
    render(
      <ForgotPasswordForm onRequestReset={onRequestReset} onResetPassword={vi.fn()} onCancel={vi.fn()} />,
    )

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(screen.getByLabelText('Reset code')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('the code is 123456')
  })

  async function advanceToResetStep(user, { code = '123456' } = {}) {
    const onRequestReset = vi.fn(() => ({ ok: true, code }))
    const onResetPassword = vi.fn()
    render(
      <ForgotPasswordForm
        onRequestReset={onRequestReset}
        onResetPassword={onResetPassword}
        onCancel={vi.fn()}
      />,
    )
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))
    return onResetPassword
  }

  it('rejects a new password shorter than 8 characters without calling onResetPassword', async () => {
    const user = userEvent.setup()
    const onResetPassword = await advanceToResetStep(user)

    await user.type(screen.getByLabelText('Reset code'), '123456')
    await user.type(screen.getByLabelText('New password'), 'short')
    await user.type(screen.getByLabelText('Confirm new password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters.')
    expect(onResetPassword).not.toHaveBeenCalled()
  })

  it('rejects mismatched new passwords without calling onResetPassword', async () => {
    const user = userEvent.setup()
    const onResetPassword = await advanceToResetStep(user)

    await user.type(screen.getByLabelText('Reset code'), '123456')
    await user.type(screen.getByLabelText('New password'), 'longenoughpw')
    await user.type(screen.getByLabelText('Confirm new password'), 'different-pw')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(onResetPassword).not.toHaveBeenCalled()
  })

  it('calls onResetPassword with the code and new password, then shows a confirmation', async () => {
    const user = userEvent.setup()
    const onRequestReset = vi.fn(() => ({ ok: true, code: '123456' }))
    const onResetPassword = vi.fn().mockResolvedValue({ ok: true })
    render(
      <ForgotPasswordForm
        onRequestReset={onRequestReset}
        onResetPassword={onResetPassword}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    await user.type(screen.getByLabelText('Reset code'), '123456')
    await user.type(screen.getByLabelText('New password'), 'newlongpassword')
    await user.type(screen.getByLabelText('Confirm new password'), 'newlongpassword')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(onResetPassword).toHaveBeenCalledWith({
      email: 'ada@gmail.com',
      code: '123456',
      newPassword: 'newlongpassword',
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Password reset. You can now sign in with your new password.',
    )
  })

  it('shows the error returned by onResetPassword for an invalid code', async () => {
    const user = userEvent.setup()
    const onRequestReset = vi.fn(() => ({ ok: true, code: '123456' }))
    const onResetPassword = vi.fn().mockResolvedValue({
      ok: false,
      message: 'Invalid or expired reset code.',
    })
    render(
      <ForgotPasswordForm
        onRequestReset={onRequestReset}
        onResetPassword={onResetPassword}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    await user.type(screen.getByLabelText('Reset code'), 'wrong-code')
    await user.type(screen.getByLabelText('New password'), 'newlongpassword')
    await user.type(screen.getByLabelText('Confirm new password'), 'newlongpassword')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid or expired reset code.')
  })
})
