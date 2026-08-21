import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactView from './ContactView'

async function fillForm(user, { name, email, message }) {
  await user.type(screen.getByLabelText('Name'), name)
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Message'), message)
}

describe('ContactView', () => {
  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<ContactView onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('rejects submission with an empty name', async () => {
    const user = userEvent.setup()
    render(<ContactView onBack={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name.')
  })

  it('rejects a malformed email', async () => {
    const user = userEvent.setup()
    render(<ContactView onBack={vi.fn()} />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Message'), 'Where is my order?')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('rejects an empty message', async () => {
    const user = userEvent.setup()
    render(<ContactView onBack={vi.fn()} />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a message.')
  })

  it('shows a confirmation after a valid submission', async () => {
    const user = userEvent.setup()
    render(<ContactView onBack={vi.fn()} />)

    await fillForm(user, { name: 'Ada Lovelace', email: 'ada@gmail.com', message: 'Where is my order?' })
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      "Thanks, Ada Lovelace. Your message has been sent — we'll reply to ada@gmail.com soon.",
    )
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })
})
