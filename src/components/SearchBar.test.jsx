import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  it('calls onSearch with the trimmed query on submit', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar query="" onSearch={onSearch} />)

    await user.type(screen.getByLabelText('Search products'), '  laptop  ')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(onSearch).toHaveBeenCalledWith('laptop')
  })

  it('does not show a Clear button when there is no active query', () => {
    render(<SearchBar query="" onSearch={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('clears the query when Clear is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar query="laptop" onSearch={onSearch} />)

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(onSearch).toHaveBeenCalledWith('')
    expect(screen.getByLabelText('Search products')).toHaveValue('')
  })
})
