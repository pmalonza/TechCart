import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VerifyEmailForm from './VerifyEmailForm'

describe('VerifyEmailForm', () => {
  it('shows the demo code for the given email', () => {
    render(
      <VerifyEmailForm
        email="ada@gmail.com"
        demoCode="123456"
        onVerify={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'A verification code was sent to ada@gmail.com. For this demo, the code is 123456.',
    )
  })

  it('calls onVerify with the email and entered code', async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn().mockResolvedValue({ ok: true })
    render(
      <VerifyEmailForm
        email="ada@gmail.com"
        demoCode="123456"
        onVerify={onVerify}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Verification code'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(onVerify).toHaveBeenCalledWith({ email: 'ada@gmail.com', code: '123456' })
  })

  it('shows the error returned by onVerify', async () => {
    const user = userEvent.setup()
    const onVerify = vi.fn().mockResolvedValue({
      ok: false,
      message: 'Invalid or expired verification code.',
    })
    render(
      <VerifyEmailForm
        email="ada@gmail.com"
        demoCode="123456"
        onVerify={onVerify}
        onCancel={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Verification code'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid or expired verification code.')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <VerifyEmailForm
        email="ada@gmail.com"
        demoCode="123456"
        onVerify={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
