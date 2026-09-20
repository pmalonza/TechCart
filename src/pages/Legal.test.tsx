import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_METHODS, TAX_RATE } from '../lib/checkout'
import { MAX_LISTINGS_PER_USER } from '../lib/listings'
import { formatPrice } from '../lib/money'
import { STORAGE_KEYS } from '../lib/storage'
import { ADA, registerAndLand } from '../test/auth'
import { renderApp } from '../test/utils'

/** Checks every long-form legal page must satisfy: sample-text notice, working contents list, reachable from the footer. */
function describeLegalPage(name: string, route: string, footerLink: string) {
  describe(`${name} page`, () => {
    it('is labelled as sample text, not legal advice', () => {
      renderApp(route)
      expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument()
      expect(screen.getByRole('note')).toHaveTextContent(/sample text for a demo store/i)
      expect(screen.getByRole('note')).toHaveTextContent(/not legal advice/i)
      expect(screen.getByText(/^Last updated /)).toBeInTheDocument()
    })

    it('sets the document title', () => {
      renderApp(route)
      expect(document.title).toBe(`${name} - TechCart`)
    })

    it('has a contents list whose links all point at real numbered sections', () => {
      renderApp(route)
      const toc = within(screen.getByRole('navigation', { name: 'On this page' }))
      const links = toc.getAllByRole('link')
      const headings = within(screen.getByRole('article')).getAllByRole('heading', { level: 2 })

      expect(links.length).toBeGreaterThanOrEqual(5)
      expect(headings).toHaveLength(links.length)
      links.forEach((link, index) => {
        const target = document.getElementById(link.getAttribute('href')!.slice(1))
        expect(target, link.textContent!).toBe(headings[index])
        expect(headings[index]).toHaveTextContent(`${index + 1}. ${link.textContent}`)
      })
    })

    it('puts each section in a landmark named by its heading', () => {
      renderApp(route)
      const headings = within(screen.getByRole('article')).getAllByRole('heading', { level: 2 })
      for (const heading of headings) {
        expect(screen.getByRole('region', { name: heading.textContent! })).toBeInTheDocument()
      }
    })

    it('is reachable from the footer and has a back button', async () => {
      const user = userEvent.setup()
      renderApp('/')
      await user.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: footerLink }))

      expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(await screen.findByRole('heading', { level: 1, name: /gadgets you will actually use/i })).toBeInTheDocument()
    })
  })
}

describeLegalPage('Terms and Conditions', '/terms', 'Terms & Conditions')

describe('Terms and Conditions content', () => {
  it('quotes the same delivery prices, threshold, tax rate and listing limit as checkout', () => {
    renderApp('/terms')
    const article = within(screen.getByRole('article'))

    for (const method of SHIPPING_METHODS) {
      expect(article.getByText(new RegExp(`${method.name}.*${formatPrice(method.priceCents).replace('$', '\\$')}`))).toBeInTheDocument()
    }
    expect(article.getByText(new RegExp(`free on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS).replace('$', '\\$')}`))).toBeInTheDocument()
    expect(article.getByText(new RegExp(`Estimated tax: ${Math.round(TAX_RATE * 100)}%`))).toBeInTheDocument()
    expect(article.getByText(new RegExp(`up to ${MAX_LISTINGS_PER_USER} products`))).toBeInTheDocument()
  })

  it('says checkout takes no payment and what is kept about a card', () => {
    renderApp('/terms')
    const article = within(screen.getByRole('article'))
    expect(article.getByText(/No payment is taken/)).toBeInTheDocument()
    expect(article.getByText(/only the card brand and the last four digits/i)).toBeInTheDocument()
  })

  it('only links to pages that exist', () => {
    renderApp('/terms')
    const links = within(screen.getByRole('article')).queryAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/privacy'])
  })
})

describeLegalPage('Privacy Policy', '/privacy', 'Privacy Policy')

describe('Privacy Policy content', () => {
  it('names every storage key the app uses, so a new one cannot be added without describing it', () => {
    renderApp('/privacy')
    const article = within(screen.getByRole('article'))
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(article.getByText(key), key).toBeInTheDocument()
    }
  })

  it('states that nothing leaves the browser and that no card details are kept', () => {
    renderApp('/privacy')
    const article = within(screen.getByRole('article'))
    expect(article.getByText(/sets no cookies/)).toBeInTheDocument()
    expect(article.getByText(/Nothing is sent to a server/)).toBeInTheDocument()
    expect(article.getByText(/full card number, expiry date and security code are never saved/)).toBeInTheDocument()
    expect(article.getByText(/Local storage is not encrypted/)).toBeInTheDocument()
  })

  it('only links to pages that exist', () => {
    renderApp('/privacy')
    const links = within(screen.getByRole('article')).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/newsletter/unsubscribe', '/help', '/terms'])
  })

  it('is linked from the terms page', () => {
    renderApp('/terms')
    expect(within(screen.getByRole('article')).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
  })

  it('is honest about deletion: account data goes, while guest orders, the cart and the newsletter stay', async () => {
    const { user, view } = await registerAndLand()
    const userId = JSON.parse(localStorage.getItem(STORAGE_KEYS.session)!) as string
    view.unmount()

    const base = {
      createdAt: '2026-09-20T10:00:00.000Z',
      lines: [{ productId: 'pulse-s5', name: 'Pulse S5', brand: 'Pulse', priceCents: 24900, quantity: 1 }],
      subtotalCents: 24900,
      shippingCents: 0,
      taxCents: 1992,
      totalCents: 26892,
      shippingMethod: 'standard',
      shippingAddress: { label: '', fullName: 'Guest Person', phone: '', line1: '1 Test Road', line2: '', city: 'Nairobi', region: '', postalCode: '00100', country: 'KE' },
      payment: { method: 'cod' },
      status: 'processing',
    }
    localStorage.setItem(
      STORAGE_KEYS.orders,
      JSON.stringify([
        { ...base, id: 'own', number: 'TC-20260920-1111', userId, email: ADA.email },
        { ...base, id: 'guest', number: 'TC-20260920-2222', userId: null, email: 'guest@example.com' },
      ]),
    )
    localStorage.setItem(STORAGE_KEYS.newsletter, JSON.stringify([{ email: 'guest@example.com', subscribedAt: base.createdAt }]))
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([{ productId: 'nimbus-air-14', quantity: 1 }]))
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(['nimbus-air-14']))
    localStorage.setItem(
      STORAGE_KEYS.messages,
      JSON.stringify([{ id: 'm1', reference: 'MSG-ABC123', name: 'Guest', email: 'guest@example.com', topic: 'other', message: 'Hello there, a test message.', createdAt: base.createdAt }]),
    )

    renderApp('/account/security')
    await user.click(await screen.findByRole('button', { name: 'Delete my account' }))
    await user.type(screen.getByLabelText('Confirm with your password'), ADA.password)
    await user.click(screen.getByRole('button', { name: 'Permanently delete account' }))
    await screen.findByRole('heading', { level: 1, name: /gadgets you will actually use/i })

    const read = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null')
    await waitFor(() => expect((read(STORAGE_KEYS.orders) as { id: string }[]).map((order) => order.id)).toEqual(['guest']))
    expect(read(STORAGE_KEYS.users)).toEqual([])
    expect(read(STORAGE_KEYS.session)).toBeNull()
    expect(read(STORAGE_KEYS.newsletter)).toHaveLength(1)
    expect(read(STORAGE_KEYS.cart)).toHaveLength(1)
    expect(read(STORAGE_KEYS.wishlist)).toEqual(['nimbus-air-14'])
    expect(read(STORAGE_KEYS.messages)).toHaveLength(1)
  })
})
