import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/utils'

const box = () => screen.getByRole('combobox', { name: 'Search products' })

describe('SearchBar', () => {
  it('shows nothing until you type', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(box())
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(box()).toHaveAttribute('aria-expanded', 'false')
  })

  it('suggests matching products as you type', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'zenith')

    const list = screen.getByRole('listbox', { name: 'Search suggestions' })
    expect(box()).toHaveAttribute('aria-expanded', 'true')
    expect(within(list).getByRole('option', { name: /zenith buds pro/i })).toBeInTheDocument()
    expect(within(list).getByRole('option', { name: /zenith studio over-ear/i })).toBeInTheDocument()
    expect(within(list).getByRole('option', { name: /see all results for/i })).toBeInTheDocument()
    expect(within(list).queryByRole('option', { name: /aurora/i })).not.toBeInTheDocument()
  })

  it('tells you when nothing matches', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'zzzzqqq')
    expect(screen.getByText(/no matches for/i)).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('searches on Enter and shows a results page', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'nimbus{Enter}')

    expect(screen.getByRole('heading', { level: 1, name: /results for .nimbus./i })).toBeInTheDocument()
    const grid = screen.getByRole('list', { name: /results for/i })
    expect(within(grid).getByRole('heading', { name: 'Nimbus Air 14' })).toBeInTheDocument()
    expect(within(grid).getByRole('heading', { name: 'Nimbus Laptop Sleeve 14' })).toBeInTheDocument()
    expect(within(grid).queryByRole('heading', { name: 'Aurora X1' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/\d+ results/)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens the highlighted suggestion with the arrow keys and Enter', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'aurora x1')
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: /^aurora x1/i })).toHaveAttribute('aria-selected', 'true')
    expect(box()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: /^aurora x1/i }).id)

    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: 'Aurora X1' })).toBeInTheDocument()
  })

  it('wraps around the list with the arrow keys and can highlight "see all results"', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'nimbus')
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: /see all results/i })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: /results for .nimbus./i })).toBeInTheDocument()
  })

  it('opens a suggestion when clicked', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'kestrel ring')
    await user.click(screen.getByRole('option', { name: /^kestrel ring/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Kestrel Ring' })).toBeInTheDocument()
  })

  it('closes the suggestions on Escape without clearing the text', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.type(box(), 'nimbus')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(box()).toHaveValue('nimbus')
  })

  it('does nothing when the box is empty', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(box())
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: /gadgets you will actually use/i })).toBeInTheDocument()
  })

  it('is pre-filled from the URL and can be cleared', async () => {
    const user = userEvent.setup()
    renderApp('/products?q=hub')
    expect(box()).toHaveValue('hub')

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(box()).toHaveValue('')
    expect(screen.getByRole('heading', { level: 1, name: 'All products' })).toBeInTheDocument()
  })
})

describe('search results page', () => {
  it('combines a search with a category', () => {
    renderApp('/products?category=laptops&q=nimbus')
    const grid = screen.getByRole('list', { name: /results for/i })
    expect(within(grid).getByRole('heading', { name: 'Nimbus Air 14' })).toBeInTheDocument()
    expect(within(grid).queryByRole('heading', { name: 'Nimbus Laptop Sleeve 14' })).not.toBeInTheDocument()
    expect(screen.getByText('Searching in Laptops.')).toBeInTheDocument()
  })

  it('keeps the search when switching category chips', () => {
    renderApp('/products?q=nimbus')
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Laptops' })).toHaveAttribute('href', '/products?category=laptops&q=nimbus')
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('href', '/products?q=nimbus')
  })

  it('shows a helpful empty state with a way out', () => {
    renderApp('/products?q=zzzzqqq')
    expect(screen.getByRole('heading', { name: /no products match your search/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('0 results')
    expect(screen.getByRole('link', { name: 'Clear search' })).toHaveAttribute('href', '/products')
  })

  it('uses the search in the page title', () => {
    renderApp('/products?q=nimbus')
    expect(document.title).toBe('Search: nimbus - TechCart')
  })
})
