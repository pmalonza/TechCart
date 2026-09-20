import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CATEGORIES } from '../data/categories'
import { renderApp } from '../test/utils'

describe('Header menu', () => {
  it('shows the main navigation links', () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/products')
  })

  it('marks the link for the current page', () => {
    renderApp('/products')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  describe('categories dropdown', () => {
    it('is collapsed until opened, then lists every category', async () => {
      const user = userEvent.setup()
      renderApp('/')
      const toggle = screen.getByRole('button', { name: /categories/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('list', { name: /categories/i })).not.toBeInTheDocument()

      await user.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      const menu = document.getElementById('categories-menu')!
      for (const category of CATEGORIES) {
        expect(within(menu).getByRole('link', { name: new RegExp(category.name) })).toHaveAttribute(
          'href',
          `/products?category=${category.id}`,
        )
      }
    })

    it('closes on Escape and returns focus to the toggle', async () => {
      const user = userEvent.setup()
      renderApp('/')
      const toggle = screen.getByRole('button', { name: /categories/i })
      await user.click(toggle)
      await user.keyboard('{Escape}')
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveFocus()
    })

    it('closes when clicking elsewhere', async () => {
      const user = userEvent.setup()
      renderApp('/')
      const toggle = screen.getByRole('button', { name: /categories/i })
      await user.click(toggle)
      await user.click(document.body)
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('navigates to the category and closes after choosing one', async () => {
      const user = userEvent.setup()
      renderApp('/')
      const toggle = screen.getByRole('button', { name: /categories/i })
      await user.click(toggle)
      await user.click(within(document.getElementById('categories-menu')!).getByRole('link', { name: /audio/i }))
      expect(screen.getByRole('heading', { level: 1, name: 'Audio' })).toBeInTheDocument()
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('mobile menu', () => {
    it('opens and closes with the menu button', async () => {
      const user = userEvent.setup()
      renderApp('/')
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      const mobile = screen.getByRole('navigation', { name: 'Mobile' })
      expect(within(mobile).getByRole('link', { name: 'Shop' })).toBeInTheDocument()
      for (const category of CATEGORIES) {
        expect(within(mobile).getByRole('link', { name: category.name })).toBeInTheDocument()
      }
      expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')

      await user.click(screen.getByRole('button', { name: 'Close menu' }))
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument()
    })

    it('closes on Escape and refocuses the menu button', async () => {
      const user = userEvent.setup()
      renderApp('/')
      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
    })

    it('closes after following a link', async () => {
      const user = userEvent.setup()
      renderApp('/')
      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.click(within(screen.getByRole('navigation', { name: 'Mobile' })).getByRole('link', { name: 'Phones' }))
      expect(screen.getByRole('heading', { level: 1, name: 'Phones' })).toBeInTheDocument()
      expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument()
    })
  })
})
