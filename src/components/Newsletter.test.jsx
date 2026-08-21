import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Newsletter from './Newsletter'

describe('Newsletter', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('subscribes a valid email and clears the field', async () => {
    const user = userEvent.setup()
    render(<Newsletter />)

    await user.type(screen.getByLabelText('Newsletter email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    expect(screen.getByRole('status')).toHaveTextContent("Subscribed! We'll send updates to ada@gmail.com.")
    expect(screen.getByLabelText('Newsletter email')).toHaveValue('')
  })

  it('rejects a malformed email', async () => {
    const user = userEvent.setup()
    render(<Newsletter />)

    await user.type(screen.getByLabelText('Newsletter email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('rejects subscribing the same email twice', async () => {
    const user = userEvent.setup()
    render(<Newsletter />)

    await user.type(screen.getByLabelText('Newsletter email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    await user.type(screen.getByLabelText('Newsletter email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    expect(screen.getByRole('alert')).toHaveTextContent('This email is already subscribed.')
  })
})
