import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEYS } from '../lib/storage'
import type { Subscriber } from '../lib/newsletter'
import { renderApp } from '../test/utils'

const stored = (): Subscriber[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.newsletter) ?? '[]')
const footer = () => within(screen.getByRole('contentinfo'))

describe('newsletter sign-up in the footer', () => {
  it('is on every page, with a labelled email field', () => {
    renderApp('/')
    expect(footer().getByRole('heading', { name: 'Get the TechCart newsletter' })).toBeInTheDocument()
    expect(footer().getByLabelText('Email address')).toHaveAttribute('type', 'email')
    expect(footer().getByRole('button', { name: 'Subscribe' })).toBeInTheDocument()
  })

  it('subscribes a valid address, confirms, and clears the field', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(footer().getByLabelText('Email address'), 'Ada@Example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))

    expect(await footer().findByRole('status')).toHaveTextContent('Thanks for subscribing! This is a demo, so no emails are actually sent.')
    expect(footer().getByLabelText('Email address')).toHaveValue('')
    expect(screen.getByTestId('announcer')).toHaveTextContent('Thanks for subscribing!')
    expect(stored().map((s) => s.email)).toEqual(['ada@example.com'])
  })

  it('shows an error for an empty or invalid address and saves nothing', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    expect(footer().getByText('Enter your email address.')).toBeInTheDocument()
    await waitFor(() => expect(footer().getByLabelText('Email address')).toHaveFocus())

    await user.type(footer().getByLabelText('Email address'), 'not-an-email')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    expect(footer().getByText('Enter a valid email address, like name@example.com.')).toBeInTheDocument()
    expect(footer().getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true')
    expect(footer().getByLabelText('Email address')).toHaveAccessibleDescription('Enter a valid email address, like name@example.com.')
    expect(footer().queryByRole('status')).not.toBeInTheDocument()
    expect(stored()).toEqual([])
  })

  it('does not add a duplicate, and says so', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(footer().getByLabelText('Email address'), 'ada@example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    await user.type(footer().getByLabelText('Email address'), 'ADA@example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))

    expect(await footer().findByRole('status')).toHaveTextContent('You are already on the list.')
    expect(stored()).toHaveLength(1)
  })

  it('clears an earlier error after a good address', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(footer().getByLabelText('Email address'), 'oops')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    await user.clear(footer().getByLabelText('Email address'))
    await user.type(footer().getByLabelText('Email address'), 'ada@example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))

    expect(await footer().findByRole('status')).toBeInTheDocument()
    expect(footer().queryByText(/valid email/)).not.toBeInTheDocument()
    expect(footer().getByLabelText('Email address')).not.toHaveAttribute('aria-invalid')
  })

  it('keeps the subscription after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/')
    await user.type(footer().getByLabelText('Email address'), 'ada@example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    await footer().findByRole('status')
    unmount()

    renderApp('/')
    await user.type(footer().getByLabelText('Email address'), 'ada@example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    expect(await footer().findByRole('status')).toHaveTextContent('You are already on the list.')
  })

  it('ignores corrupt stored data instead of crashing', async () => {
    localStorage.setItem(STORAGE_KEYS.newsletter, '{"not":"a list"}')
    const user = userEvent.setup()
    renderApp('/')
    await user.type(footer().getByLabelText('Email address'), 'ada@example.com')
    await user.click(footer().getByRole('button', { name: 'Subscribe' }))
    expect(await footer().findByRole('status')).toHaveTextContent('Thanks for subscribing!')
    expect(stored()).toHaveLength(1)
  })

  it('reports it when the browser cannot save the address', async () => {
    const original = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === STORAGE_KEYS.newsletter && value.includes('@')) throw new DOMException('full', 'QuotaExceededError')
      original.call(this, key, value)
    })
    try {
      const user = userEvent.setup()
      renderApp('/')
      await user.type(footer().getByLabelText('Email address'), 'ada@example.com')
      await user.click(footer().getByRole('button', { name: 'Subscribe' }))

      expect(footer().getByText('Your browser could not save that. Please try again.')).toBeInTheDocument()
      expect(footer().queryByRole('status')).not.toBeInTheDocument()
    } finally {
      spy.mockRestore()
    }
  })
})

describe('unsubscribing', () => {
  const seed = (...emails: string[]) =>
    localStorage.setItem(STORAGE_KEYS.newsletter, JSON.stringify(emails.map((email) => ({ email, subscribedAt: '2026-05-01T10:00:00.000Z' }))))

  it('is linked from the footer form', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(footer().getByRole('link', { name: 'Unsubscribe' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Unsubscribe from the newsletter' })).toBeInTheDocument()
  })

  it('removes the address from the list', async () => {
    seed('ada@example.com', 'bob@example.com')
    const user = userEvent.setup()
    renderApp('/newsletter/unsubscribe')
    const form = within(screen.getByRole('form', { name: 'Unsubscribe' }))
    await user.type(form.getByLabelText('Email address'), 'ADA@example.com')
    await user.click(form.getByRole('button', { name: 'Unsubscribe' }))

    expect(await within(screen.getByRole('main')).findByText('ADA@example.com has been unsubscribed.')).toBeInTheDocument()
    expect(stored().map((s) => s.email)).toEqual(['bob@example.com'])
  })

  it('says so when the address was not subscribed', async () => {
    seed('bob@example.com')
    const user = userEvent.setup()
    renderApp('/newsletter/unsubscribe')
    const form = within(screen.getByRole('form', { name: 'Unsubscribe' }))
    await user.type(form.getByLabelText('Email address'), 'ada@example.com')
    await user.click(form.getByRole('button', { name: 'Unsubscribe' }))

    expect(await within(screen.getByRole('main')).findByText(/was not on the list/)).toBeInTheDocument()
    expect(stored()).toHaveLength(1)
  })

  it('validates the address', async () => {
    const user = userEvent.setup()
    renderApp('/newsletter/unsubscribe')
    const form = within(screen.getByRole('form', { name: 'Unsubscribe' }))
    await user.click(form.getByRole('button', { name: 'Unsubscribe' }))
    expect(form.getByText('Enter your email address.')).toBeInTheDocument()
    await waitFor(() => expect(form.getByLabelText('Email address')).toHaveFocus())
  })
})
