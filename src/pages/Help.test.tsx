import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FAQS } from '../data/faq'
import { FAQ_TOPICS, MAX_MESSAGES, type ContactMessage } from '../lib/help'
import { STORAGE_KEYS } from '../lib/storage'
import { registerAndLand } from '../test/auth'
import { renderApp } from '../test/utils'

const stored = (): ContactMessage[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) ?? '[]')
const main = () => within(screen.getByRole('main'))
const form = () => within(screen.getByRole('form', { name: 'Contact us' }))

async function fill(user: ReturnType<typeof userEvent.setup>, message = 'My order has not arrived yet, please help.') {
  await user.type(form().getByLabelText('Your name'), 'Ada Lovelace')
  await user.type(form().getByLabelText('Email address'), 'ada@example.com')
  await user.selectOptions(form().getByLabelText('What is it about?'), 'order')
  await user.type(form().getByLabelText('Message'), message)
}

describe('help page: questions', () => {
  it('is reachable from the footer', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Help' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Help' })).toBeInTheDocument()
    expect(document.title).toBe('Help - TechCart')
  })

  it('lists every question under its topic heading', () => {
    renderApp('/help')
    for (const topic of FAQ_TOPICS) expect(main().getByRole('heading', { level: 3, name: topic.name })).toBeInTheDocument()
    for (const faq of FAQS) expect(main().getByText(faq.question)).toBeInTheDocument()
    expect(main().getByText(`${FAQS.length} questions.`)).toBeInTheDocument()
  })

  it('opens and closes an answer, and links to a helpful page', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    const question = main().getByText('Where can I see my orders?')
    const details = question.closest('details')!
    expect(details).not.toHaveAttribute('open')

    await user.click(question)
    expect(details).toHaveAttribute('open')
    expect(within(details).getByRole('link', { name: 'Go to my orders' })).toHaveAttribute('href', '/account/orders')
    await user.click(question)
    expect(details).not.toHaveAttribute('open')
  })

  it('answers with the same delivery figures checkout uses', () => {
    renderApp('/help')
    const details = main().getByText('How much does delivery cost?').closest('details')!
    expect(details).toHaveTextContent('$4.99')
    expect(details).toHaveTextContent('$14.99')
    expect(details).toHaveTextContent('$100.00')
  })

  it('filters the questions as you type and reports how many match', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    await user.type(main().getByLabelText('Search the questions'), 'password')

    expect(main().getByText('I forgot my password. What do I do?')).toBeInTheDocument()
    expect(main().queryByText('How much does delivery cost?')).not.toBeInTheDocument()
    expect(main().getByLabelText('Search the questions')).toHaveAccessibleDescription(/questions? match/)
    // Topics with no match disappear.
    expect(main().queryByRole('heading', { level: 3, name: 'Selling' })).not.toBeInTheDocument()
  })

  it('says so when nothing matches, and offers the contact form', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    await user.type(main().getByLabelText('Search the questions'), 'zzzz')

    expect(main().getAllByText('No questions match.')).not.toHaveLength(0)
    expect(main().getByRole('link', { name: 'contact us' })).toHaveAttribute('href', '#contact')
    expect(main().queryByRole('group')).not.toBeInTheDocument()

    await user.clear(main().getByLabelText('Search the questions'))
    expect(main().getByText('Is TechCart a real store?')).toBeInTheDocument()
  })
})

describe('help page: contact form', () => {
  it('shows an error for every empty field and focuses the first', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    await user.click(form().getByRole('button', { name: 'Send message' }))

    expect(form().getByText('Enter your name.')).toBeInTheDocument()
    expect(form().getByText('Enter your email address.')).toBeInTheDocument()
    expect(form().getByText('Choose what your message is about.')).toBeInTheDocument()
    expect(form().getByText(/at least 10 characters/)).toBeInTheDocument()
    expect(form().getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(form().getByLabelText('Your name')).toHaveFocus())
    expect(stored()).toEqual([])
  })

  it('counts characters as you type', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    await user.type(form().getByLabelText('Message'), 'hello')
    expect(form().getByText('5 / 1,000 characters')).toBeInTheDocument()
  })

  it('saves a message with a reference, says it was not sent, and keeps name and email for the next one', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    await fill(user)
    await user.click(form().getByRole('button', { name: 'Send message' }))

    const [saved] = stored()
    expect(saved).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', topic: 'order', message: 'My order has not arrived yet, please help.' })
    expect(saved.reference).toMatch(/^MSG-[0-9A-F]{6}$/)
    expect(main().getByText(new RegExp(`Message ${saved.reference} saved.*not sent to anyone`))).toBeInTheDocument()
    expect(screen.getByTestId('announcer')).toHaveTextContent(saved.reference)
    expect(form().getByLabelText('Message')).toHaveValue('')
    expect(form().getByLabelText('What is it about?')).toHaveValue('')
    expect(form().getByLabelText('Your name')).toHaveValue('Ada Lovelace')
  })

  it('lists saved messages and deletes one on request', async () => {
    const user = userEvent.setup()
    renderApp('/help')
    await fill(user, 'First message about my order.')
    await user.click(form().getByRole('button', { name: 'Send message' }))
    await user.selectOptions(form().getByLabelText('What is it about?'), 'other')
    await user.type(form().getByLabelText('Message'), 'Second message about something else.')
    await user.click(form().getByRole('button', { name: 'Send message' }))

    const list = within(main().getByRole('list', { name: 'Your saved messages' }))
    expect(list.getAllByRole('listitem')).toHaveLength(2)
    expect(list.getAllByRole('listitem')[0]).toHaveTextContent('Second message about something else.')

    const first = stored()[1]
    await user.click(list.getByRole('button', { name: `Delete message ${first.reference}` }))
    expect(within(main().getByRole('list', { name: 'Your saved messages' })).getAllByRole('listitem')).toHaveLength(1)
    expect(stored()).toHaveLength(1)
    expect(screen.getByTestId('announcer')).toHaveTextContent(`Message ${first.reference} deleted`)
  })

  it('refuses a new message once the saved-message limit is reached', async () => {
    const existing = Array.from({ length: MAX_MESSAGES }, (_, i) => ({
      id: `m${i}`,
      reference: `MSG-00000${i % 10}`,
      name: 'Ada',
      email: 'ada@example.com',
      topic: 'other',
      message: `Saved message number ${i}.`,
      createdAt: '2026-09-20T10:00:00.000Z',
    }))
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(existing))
    const user = userEvent.setup()
    renderApp('/help')
    await fill(user)
    await user.click(form().getByRole('button', { name: 'Send message' }))

    expect(await form().findByRole('alert')).toHaveTextContent(/maximum/)
    expect(stored()).toHaveLength(MAX_MESSAGES)
  })

  it('reports it when the browser cannot save the message', async () => {
    const original = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === STORAGE_KEYS.messages && value.includes('@')) throw new DOMException('full', 'QuotaExceededError')
      original.call(this, key, value)
    })
    try {
      const user = userEvent.setup()
      renderApp('/help')
      await fill(user)
      await user.click(form().getByRole('button', { name: 'Send message' }))

      expect(await form().findByRole('alert')).toHaveTextContent(/could not save/)
      expect(form().getByLabelText('Message')).toHaveValue('My order has not arrived yet, please help.')
      expect(stored()).toEqual([])
    } finally {
      spy.mockRestore()
    }
  })

  it('keeps messages after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/help')
    await fill(user)
    await user.click(form().getByRole('button', { name: 'Send message' }))
    unmount()

    renderApp('/help')
    expect(within(main().getByRole('list', { name: 'Your saved messages' })).getAllByRole('listitem')).toHaveLength(1)
  })

  it('fills in the name and email of a signed-in user', async () => {
    const { view } = await registerAndLand()
    view.unmount()
    renderApp('/help')
    expect(form().getByLabelText('Your name')).toHaveValue('Ada Lovelace')
    expect(form().getByLabelText('Email address')).toHaveValue('ada@example.com')
  })

  it('ignores corrupt stored messages instead of crashing', () => {
    localStorage.setItem(STORAGE_KEYS.messages, '{"not":"a list"}')
    renderApp('/help')
    expect(form().getByRole('button', { name: 'Send message' })).toBeInTheDocument()
    expect(main().queryByRole('list', { name: 'Your saved messages' })).not.toBeInTheDocument()
  })
})
