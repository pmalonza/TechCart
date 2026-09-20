import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_METHODS, TAX_RATE } from '../lib/checkout'
import { MAX_LISTINGS_PER_USER } from '../lib/listings'
import { formatPrice } from '../lib/money'
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

  it('does not link to pages that do not exist', () => {
    renderApp('/terms')
    const paths = within(screen.getByRole('article')).queryAllByRole('link')
    expect(paths).toEqual([])
  })
})
