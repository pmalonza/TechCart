import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders all products by default', () => {
    render(<App />)
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.getByText('Nova X12 Smartphone')).toBeInTheDocument()
  })

  it('filters to a category when selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))

    expect(screen.getByText('Nova X12 Smartphone')).toBeInTheDocument()
    expect(screen.queryByText('AeroBook 14" Ultralight Laptop')).not.toBeInTheDocument()
  })

  it('narrows further to a subcategory when selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Electronics' }))
    await user.click(screen.getByRole('button', { name: 'TVs' }))

    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
    expect(screen.queryByText('SweepMaster Robot Vacuum')).not.toBeInTheDocument()
  })

  it('resets the subcategory when switching categories', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Electronics' }))
    await user.click(screen.getByRole('button', { name: 'TVs' }))
    await user.click(screen.getByRole('button', { name: 'Computers' }))

    expect(screen.getByRole('button', { name: 'All Computers' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.getByText('27" 1440p Monitor')).toBeInTheDocument()
  })

  it('returns to all products when "All products" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))
    await user.click(screen.getByRole('button', { name: 'All products' }))

    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All Phones' })).not.toBeInTheDocument()
  })
})
